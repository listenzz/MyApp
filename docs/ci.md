我们使用 GitLab 作为代码仓库，使用 [GitLab CI/CD](https://docs.gitlab.com/ee/ci/README.html) 作为持续集成，持续部署工具。

我们要实现如下自动化流程

1. 代码提交或合并到仓库后，启动测试、构建过程
2. 每日定时发布新包或可手动发布
3. 可以选择构建不同环境（qa, production）的 ipa 或 apk 包
4. iOS 自动将 ipa 发布到 App Store Connect，
5. Android 自动将 apk 发布到自建的文件服务器并发送 slack 通知

## 安装依赖

安装以下依赖，稍后脚本需要用到

```
yarn add 7zip-bin --dev
```

## 编写 CI 脚本

在 react-native 项目根目录下创建名为 ci 的文件夹

创建 ci/utils.js 文件，其中 `SLACK_WEB_HOOK_URL` 请替换成你司的 slack web hook url。

```js
// utils.js
const fs = require('fs')
const path = require('path')
const { spawnSync, execSync } = require('child_process')

// 不适合放在 config.js 会引起循环依赖
const SLACK_WEB_HOOK_URL =
  process.env.SLACK_WEB_HOOK_URL ||
  'https://hooks.slack.com/services/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'

/**
 *
 * @param {string} src
 * @param {string} dist
 */
function copy(src, dist) {
  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist)
  }
  const files = fs.readdirSync(src)
  files.forEach((file) => {
    const srcFile = path.join(src, file)
    const distFile = path.join(dist, file)
    const stats = fs.statSync(srcFile)
    if (stats.isFile()) {
      const read = fs.createReadStream(srcFile)
      const write = fs.createWriteStream(distFile)
      read.pipe(write)
    } else if (stats.isDirectory()) {
      copy(srcFile, distFile)
    }
  })
}

function gitTag() {
  let tag
  try {
    tag = execSync(`git describe --tags --abbrev=0 --always`, {
      encoding: 'utf8',
    })
  } catch {
    tag = '1.0.0'
  }
  return tag.trim()
}

/**
 *
 * @param {string} str
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 *
 * @param {string} cmd
 * @param {{}} [env]
 * @param {string} [cwd]
 */
function sh(cmd, env = process.env, cwd) {
  const child = spawnSync(cmd, {
    stdio: 'inherit',
    shell: true,
    env,
    cwd,
  })
  if (child.status !== 0) {
    process.exit(child.status)
  }
}

/**
 *
 * @param {string} message
 */
function slack(message) {
  const cmd = `curl -X POST \
    -H 'Content-type: application/json' \
    --data '{"text":"${message}"}' \
    ${SLACK_WEB_HOOK_URL}`
  sh(cmd)
}

module.exports = {
  copy,
  gitTag,
  capitalize,
  sh,
  slack,
}
```

编写 ci/config.js 文件，这里定义了常量，通常，你需要替换 `FILE_SERVER` `BUGLY_DIST_URL` `APP_NAME` `APP_MODULE` `APPLICATION_ID` 这几个常量。

```js
// config.js
const path = require('path')
const { capitalize, gitTag } = require('./utils')

// bugly 内测分发
const BUGLY_DIST_URL = process.env.BUGLY_DIST_URL || 'https://beta.bugly.qq.com/xxxx'

// 文件服务器
const FILE_SERVER = process.env.FILE_SERVER || 'http://192.168.1.134:8000'
// 平台 android 或 ios
const PLATFORM = process.argv[2] || 'ios'

// 开发环境 production qa dev
// 不能通过 CI 直接注入 NODE_ENV ，否则会产生很奇怪的 BUG
const ENVIRONMENT = process.env.ENVIRONMENT || 'qa'
process.env.ENVIRONMENT = ENVIRONMENT

const ENVIRONMENT_CAPITALIZE = capitalize(ENVIRONMENT)
// app 名字
const APP_NAME = process.env.APP_NAME || (PLATFORM === 'ios' ? 'MyApp' : 'myapp')
process.env.APP_NAME = APP_NAME

const APP_MODULE = process.env.APP_MODULE || 'app'

// 应用 bundle id
const APPLICATION_ID = process.env.APPLICATION_ID || 'com.xxxxxx.myapp'
process.env.APPLICATION_ID = APPLICATION_ID

// 版本
const VERSION_NAME = process.env.VERSION_NAME || gitTag()
process.env.VERSION_NAME = VERSION_NAME

// 版本号
const VERSION_CODE = (process.env.CI_PIPELINE_IID && Number(process.env.CI_PIPELINE_IID)) || 1
process.env.VERSION_CODE = process.env.CI_PIPELINE_IID || '1'

// 构建目录
const BUILD_DIR =
  PLATFORM === 'ios'
    ? path.resolve(__dirname, '../ios/build')
    : path.resolve(__dirname, `../android/${APP_MODULE}/build`)

// 制品目录
const ARTIFACTS_DIR = PLATFORM === 'ios' ? BUILD_DIR : path.resolve(BUILD_DIR, 'artifacts')

// 是否需要打渠道包
const NEED_TO_BUILD_CHANNELS = !!process.env.BUILD_CHANNELS
// 渠道包原始目录
const CHANNELS_SOURCE_DIR = path.join(BUILD_DIR, 'outputs/channels')
const CHANNELS_FILENAME = process.env.CHANNELS_FILENAME || 'channels.7z'

// Android APK 原始目录
const APK_SOURCE_DIR = path.resolve(BUILD_DIR, `outputs/apk/${ENVIRONMENT}/release/`)

module.exports = {
  BUGLY_DIST_URL,
  FILE_SERVER,
  PLATFORM,
  ENVIRONMENT,
  ENVIRONMENT_CAPITALIZE,
  APP_NAME,
  APP_MODULE,
  APPLICATION_ID,
  VERSION_NAME,
  VERSION_CODE,
  ARTIFACTS_DIR,
  BUILD_DIR,
  NEED_TO_BUILD_CHANNELS,
  CHANNELS_FILENAME,
  CHANNELS_SOURCE_DIR,
  APK_SOURCE_DIR,
}
```

编写 ci/build.js 文件，这个脚本负责打包。

```js
// build.js
const path = require('path')
const fs = require('fs')
const { sh, copy } = require('./utils')

const {
  ENVIRONMENT,
  ENVIRONMENT_CAPITALIZE,
  PLATFORM,
  APP_NAME,
  VERSION_NAME,
  VERSION_CODE,
  NEED_TO_BUILD_CHANNELS,
  CHANNELS_SOURCE_DIR,
  CHANNELS_FILENAME,
  FILE_SERVER,
  ARTIFACTS_DIR,
  APK_SOURCE_DIR,
} = require('./config')

// ------------------------------- ios -------------------------------------
if (PLATFORM === 'ios') {
  const workdir = process.env.IOS_DIR || path.resolve(__dirname, '../ios')
  if (process.env.SHOULD_RUBY_GEM_UPDATE === 'true') {
    sh(`gem install bundler && bundle install`, undefined, workdir)
  }
  sh(`bundle exec fastlane build`, undefined, workdir)
  process.exit(0)
}

// ------------------------------- android -------------------------------------
// 打基础包
const workdir = process.env.ANDROID_DIR || path.resolve(__dirname, '../android')
sh(`./gradlew assemble${ENVIRONMENT_CAPITALIZE}Release`, undefined, workdir)

// 打渠道包
if (NEED_TO_BUILD_CHANNELS) {
  sh(`./gradlew rebuildChannel`, undefined, workdir)

  const { path7za } = require('7zip-bin')
  const { execSync } = require('child_process')

  /**
   * 为了避免执行 yarn install, 不适合放到 utils 中，因为有 7zip-bin 依赖
   * @param {string} dir
   * @param {string} path
   */
  function compress(dir, path) {
    let cmd = `${path7za} a ${path} ${dir}`.replace('\n', '')
    console.log(`executing command: ${cmd}`)
    const stdout = execSync(cmd, { maxBuffer: 5000 * 1024 })
    console.log(stdout.toString())
  }

  // 压缩渠道包
  // 渠道包太大，不能上传到 artifacts
  const channels = path.join(CHANNELS_SOURCE_DIR, CHANNELS_FILENAME)
  compress(CHANNELS_SOURCE_DIR, channels)

  // 上传渠道包
  const dest = `android/${APP_NAME}/${ENVIRONMENT}/${VERSION_NAME}`
  const filename = `channels-${ENVIRONMENT}-${VERSION_NAME}-${VERSION_CODE}.7z`
  sh(`curl -F file=@${channels} -F filename=${filename} ${FILE_SERVER}/${dest}`)
}

// 整理制品
// Android 构建会产生许多中间物，它们都保存在 build 文件夹中，
// 我们需要抽取需要的文件，保存到指定目录让 CI 作为 artifacts 上传
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR)
}

// apk
copy(APK_SOURCE_DIR, ARTIFACTS_DIR)
```

编写 ci/upload.js 文件，这个脚本负责上传 ipa 包到 App Store Connect 或上传 apk 包到文件服务器。

```js
// upload.js
const path = require('path')
const { sh, slack } = require('./utils')
const {
  ENVIRONMENT,
  PLATFORM,
  APP_NAME,
  APP_MODULE,
  VERSION_NAME,
  VERSION_CODE,
  FILE_SERVER,
  ARTIFACTS_DIR,
  BUGLY_DIST_URL,
} = require('./config')

if (PLATFORM === 'ios') {
  // -------------------------------ios-------------------------------------
  const workdir = process.env.IOS_DIR || path.resolve(__dirname, '../ios')
  if (ENVIRONMENT === 'production') {
    sh(`bundle exec fastlane upload_ipa_to_testflight`, undefined, workdir)
  } else {
    sh(`bundle exec fastlane upload_ipa_to_bugly`, undefined, workdir)
    slack(`ios-${APP_NAME}-${ENVIRONMENT} 有新的版本了，${BUGLY_DIST_URL}`)
  }
  process.exit(0)
}

// -------------------------------android-------------------------------------
const dest = `android/${APP_NAME}/${ENVIRONMENT}/${VERSION_NAME}`

// 上传 apk 基础包
const apk = path.join(ARTIFACTS_DIR, `${APP_MODULE}-${ENVIRONMENT}-arm64-v8a-release.apk`)
let filename = `${APP_NAME}-${ENVIRONMENT}-${VERSION_NAME}-${VERSION_CODE}.apk`

if (process.env.CI_COMMIT_SHORT_SHA) {
  filename = `${APP_NAME}-${ENVIRONMENT}-${VERSION_NAME}-${VERSION_CODE}-${process.env.CI_COMMIT_SHORT_SHA}.apk`
}

sh(`curl --http1.1 -F file=@${apk} -F filename=${filename} ${FILE_SERVER}/${dest}`)

// 发布 slack 通知
slack(`android-${APP_NAME}-${ENVIRONMENT} 有新的版本了，${FILE_SERVER}/${dest}`)
```

## 编写 .gitlab-ci.yml

在根目录创建 .gitlab-ci.yml 文件，该文件由 [YAML 语言](http://www.ruanyifeng.com/blog/2016/07/yaml.html?f=tt) 编写，更多的配置可查看[官方文档](https://docs.gitlab.com/ee/ci/yaml/README.html)。

```yml
# .gitlab-ci.yml
before_script:
  - export

stages:
  - build
  - deploy

variables:
  LC_ALL: 'en_US.UTF-8'
  LANG: 'en_US.UTF-8'
  APP_MODULE: app

build:ios:
  stage: build
  artifacts:
    paths:
      - ios/build/
  script:
    - yarn install
    - node ./ci/build.js ios
  tags:
    - ios
  except:
    refs:
      - tags
    variables:
      - $ANDROID_ONLY

deploy:ios:upload:
  stage: deploy
  dependencies:
    - build:ios
  script:
    - node ./ci/upload.js ios
  allow_failure: true
  only:
    - schedules
  tags:
    - ios
  except:
    variables:
      - $ANDROID_ONLY

build:android:
  stage: build
  script:
    - yarn install
    - node ./ci/build.js android
  artifacts:
    paths:
      - android/${APP_MODULE}/build/artifacts/
  tags:
    - android
  except:
    refs:
      - tags
    variables:
      - $IOS_ONLY

deploy:android:upload:
  stage: deploy
  dependencies:
    - build:android
  script:
    - node ./ci/upload.js android
  allow_failure: true
  only:
    - schedules
  tags:
    - android
  except:
    variables:
      - $IOS_ONLY
```

## 创建 GitLab 仓库

添加如下配置到 .gitignore 中

```
Pods/
builds/
```

我们在公司自建的 GitLab 服务器上创建一个新的项目, 根据指引，执行如下命令，将代码推到仓库。

```
cd existing_folder
git init
git remote add origin git@git.xxxxxx.com:react-native/myapp.git
git add .
git commit -m "Initial commit"
git push -u origin master
```

## 安装和注册 GitLab Runner

[GitLab Runner](https://docs.gitlab.com/runner/) 是用来跑构建和部署任务的，我们需要在 CI 服务器或本机[安装](https://docs.gitlab.com/runner/install/osx.html)。

1. 下载 Runner

```
sudo curl --output /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-darwin-amd64
```

2. 赋予执行权限

```
sudo chmod +x /usr/local/bin/gitlab-runner
```

3. 注册 Runner

在 GitLab 上打开项目，找到左侧菜单 **Settings -> CI / CD -> Runners -> Expand**

![](./assets/gitlab_runner.jpg)

在这里，有我们注册需要用到的信息，也可以注册 Shared Runners 或 Group Runners ，这需要 GitLab 的管理员或项目组的 owner 为你提供 token

Shared Runners 对 GitLab 上的所有项目生效

Group Runners 对项目组的所有项目生效

Specific Runner 只对该项目生效

输入如下命令，开始注册

```
gitlab-runner register
```

tags 填写 ios,android,react-native

executor 填写 shell

![](./assets/gitlab_runner_register.jpg)

刷新界面，可以看到刚刚注册的 Runner

![](./assets/gitlab_runner_inactive.png)

但是处于未激活状态，执行以下命令，激活该 Runner

```
gitlab-runner install
gitlab-runner start
```

再次刷新页面，可以看到 Runner 已经被激活

> GitLab Runner 内部使用的 shell 是 bash，如果主机的默认 shell 是 zsh，需要在 ~/.bash_profile 文件中添加 `source ~/.zshrc`

> GitLab Runner 的配置文件位于 ~/.gitlab-runner/config.toml

## 注入环境变量

我们的脚本依赖了许多环境变量，我们可以通过以下方式配置那些不会经常发生变化的环境变量。

前往 **Settings -> CI / CD -> Variables**

分别注入 `FASTLANE_USER` `FASTLANE_PASSWORD` `MATCH_GIT_URL` `MATCH_PASSWORD` `BUGLY_DIST_URL` `FILE_SERVER` 等环境变量

![](./assets/gitlab_variables_1.png)

其中，`FASTLANE_USER` 是 Apple ID，`FASTLANE_PASSWORD` 是 Apple ID 的登录密码，`MATCH_GIT_URL` 是我们通过 match 管理的 ios 开发证书的 git 地址，`MATCH_PASSWORD` 是我们为 match 设置的密码。

`FASTLANE_SESSION` 和 `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD` 用于解决 Apple ID 二因素登录问题。

#### 获取 FASTLANE_SESSION

运行以下命令，获取 `FASTLANE_SESSION`，记得把 `user@email.com` 替换成你的 Apple ID。

```sh
fastlane spaceauth -u user@email.com
```

执行成功后，问你要不要把获得的 session 字符串拷贝到剪贴板，选择 y。

> `FASTLANE_SESSION` 可能有期限，记得更新

#### 获取 FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD

前往 [Apple ID 管理页面](https://appleid.apple.com/)

找到**安全**选卡，点击**App 专用密码**下的**生成密码**按钮，根据指引，即可获得 `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`

![](./assets/apple_application_specific_password.png)

## 自动触发每日构建、部署

根据我们在 .gitlab-ci.yml 文件的配置，当有新的代码 push 或 merge 到仓库，将会自动触发构建流程。

我们也可以配置每日自动构建、部署。

在 GitLab 上打开项目，找到左侧菜单 **CI / CD -> Schedules**

![](./assets/gitlab_schedules.png)

点击绿色的 "**New schedule**" 按钮

![](./assets/gitlab_schedule_create_1.png)

在这里，我们注入了 `ENVIRONMENT` 和 `BUILD_CHANNELS` 这两个环境变量，表示要打生产环境的包，并且 Android 需要打渠道包。是的，我们在这里配置那些会经常发生变化的环境变量。

一个定时构建任务就创建好了，如果有需要，也可以点击 Play 按钮立即触发构建、部署任务

![](./assets/gitlab_schedule_play_1.png)

如果只想手动触发而不希望定时触发，在创建 Schedule 时把 Acitive 的勾去掉就好。

下面，就让我们来 Play 一下吧：

![](./assets/gitlab_pipelines.png)

> 我们还可以利用 **Settings -> CI / CD -> Pipeline triggers** 来给测试同学提供一个触发构建和部署的页面，如果他们有需要的话。

## 本地测试

所有脚本均可以在本机进行测试

cd 到项目根目录，分别输入以下命令试试

调试 ios 打包脚本

```
node ./ci/build.js ios
```

调试在 gitlab-ci.yml 中配置的任务，此时会注入一些 CI 环境变量

```
gitlab-runner exec shell build:ios
```
