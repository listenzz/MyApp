# 使用 GitLab CI/CD 来实现持续集成和持续交付

我们使用 GitLab 作为代码仓库，使用 [GitLab CI/CD](https://docs.gitlab.com/ee/ci/README.html) 作为持续集成，持续部署工具。

我们要实现如下自动化流程

1. 代码提交或合并到仓库后，启动测试、构建过程
2. 每日定时发布新包或可手动发布
3. 可以选择构建不同环境（qa, production）的 ipa 或 apk
4. iOS 自动将测试包发布到自建的文件服务器，并可扫码安装
5. iOS 自动将生产包发布到 App Store Connect
6. Android 自动将 apk 发布到自建的文件服务器，并可扫码安装

## 自建文件服务器

为了方便交付，我们需要部署一个文件服务器。我们上传 apk 或 ipa 到该服务器，测试组同学通过扫码安装即可。

我们在 GitHub 找到了一个开源的文件服务器，[Go Http File server](https://github.com/codeskyblue/gohttpserver)。

我们把该文件服务器部署到外网，并且支持 https，因为部署 ipa 需要 https 协议。

## 安装和注册 GitLab Runner

[GitLab Runner](https://docs.gitlab.com/runner/) 是用来跑构建和部署任务的，我们需要在 CI 服务器或本机[安装](https://docs.gitlab.com/runner/install/osx.html)。

1. 通过 Homebrew 安装 GitLab Runner

```
brew install gitlab-runner
```

2. 注册 Runner

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

分别注入 `APP_STORE_CONNECT_API_KEY_PATH` `FASTLANE_TEAM_ID` `FILE_SERVER` `MATCH_GIT_URL` `SLACK_WEB_HOOT_URL` 等环境变量

![](./assets/gitlab_variables_1.png)

还记得 fastlane 目录下那个 .env 文件吗？在跑 CI 的机器上是不需要它的，因为可以通过 CI 注入环境变量。

别忘了把 fastlane API Key JSON file 拷贝到 `APP_STORE_CONNECT_API_KEY_PATH` 所指向的路径。

## 编写 CI 脚本

在 react-native 项目根目录下创建名为 ci 的文件夹

创建 ci/utils.js 文件，这个文件负责提供一些工具函数，具体内容请查看 ci/utils.js 文件。

其中 `SLACK_WEB_HOOK_URL` 请替换成你司的 slack web hook url。

创建 ci/config.js 文件，这里定义了常量， 某些常量的值通过读取环境变量获得。 通常，你需要替换 `FILE_SERVER` `APP_NAME` `APP_MODULE` `APPLICATION_ID` 这几个常量。具体内容请查看 ci/config.js 文件

编写打包脚本，关键代码如下

```js
// android 打包脚本，具体请查看 ci/pack/android.js 文件
const workdir = process.env.ANDROID_DIR || path.join(REACT_ROOT, 'android')

sh(`./gradlew assemble${ENVIRONMENT_CAPITALIZE}Release`, { cwd: workdir })
```

```js
// ios 打包脚本，具体请查看 ci/pack/ios.js 文件
const workdir = process.env.IOS_DIR || path.join(REACT_ROOT, 'ios')

if (process.env.SHOULD_RUBY_GEM_UPDATE === 'true') {
  sh(`gem install bundler && bundle install`, { cwd: workdir })
}
sh('bundle exec fastlane build', { cwd: workdir })
```

包打好后，自然要上传到服务器，以下是上传文件的关键代码

```js
// android 上传 apk 脚本，具体请查看 ci/upload/android.js
const apk = path.join(ARTIFACTS_DIR, `${APP_MODULE}-${ENVIRONMENT}-${abi}-${BUILD_TYPE}.apk`)
let filename = `${APP_NAME}-${ENVIRONMENT}-${abi}-${BUILD_TYPE}-${VERSION_NAME}-${VERSION_CODE}.apk`

if (process.env.CI_BUILD_REF_SLUG) {
  filename = `${APP_NAME}-${process.env.CI_BUILD_REF_SLUG}-${ENVIRONMENT}-${abi}-${BUILD_TYPE}-${VERSION_NAME}-${VERSION_CODE}.apk`
}

uploadFile(apk, filename, `${FILE_SERVER}/${dest}`)
```

```js
// ios 上传 ipa 脚本，具体请查看 ci/upload/ios.js
uploadFile(`${file}.ipa`, `${filename}.ipa`, `${FILE_SERVER}/${dest}`)
uploadFile(`${file}.plist`, `${filename}.plist`, `${FILE_SERVER}/${dest}`)
uploadFile(`${file}.html`, `${filename}.html`, `${FILE_SERVER}/${dest}`)
```

iOS 除了需要上传 ipa 包，还需要上传一个 plist 文件和一个 html 文件。

html 文件提供一个二维码，通过 iphone 的相机扫码后打开，点击网页上的按钮即可安装 ipa 包进行测试。

html 通过模版生成，具体内容请查看 ci/upload/template/ipa.html 文件，关键代码如下

```html
<div class="container">
  <h1>使用相机扫描二维码</h1>
  <h3>{AppVersion}</h3>
  <div id="qrcode"></div>
  <div class="download">
    <a title="iPhone" href="itms-services://?action=download-manifest&url={PListUrl}">点击下载安装</a>
  </div>
  <div class="server">
    <a title="iPhone" href="{ServerUrl}">前往文件服务器</a>
  </div>
</div>
```

这里使用了苹果提供的 `itms-services` 协议，{PListUrl} 会被替换成 plist 文件所在 url。

plist 文件通过模版生成，具体内容请查看 ci/upload/template/ipa.plist 文件，关键代码如下

```xml
<key>assets</key>
<array>
    <dict>
        <key>kind</key>
        <string>software-package</string>
        <key>url</key>
        <string>{IpaUrl}</string>
    </dict>
</array>
```

其中 {IpaUrl} 会被替换成 ipa 文件所在 url。

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
    - node ./ci/build ios
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
    - node ./ci/upload ios
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
    - node ./ci/build android
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

## 自动触发每日构建、部署

根据我们在 .gitlab-ci.yml 文件的配置，当有新的代码 push 或 merge 到仓库，将会自动触发构建流程。

我们也可以配置每日自动构建、部署。

在 GitLab 上打开项目，找到左侧菜单 **CI / CD -> Schedules**

![](./assets/gitlab_schedules.png)

点击绿色的 "**New schedule**" 按钮

![](./assets/gitlab_schedule_create_1.png)

在这里，我们注入了 `ENVIRONMENT` 等环境变量，表示要打生产环境的包。是的，我们在这里配置那些会经常发生变化的环境变量。

一个定时构建任务就创建好了，如果有需要，也可以点击 Play 按钮立即触发构建、部署任务

![](./assets/gitlab_schedule_play_1.png)

如果只想手动触发而不希望定时触发，在创建 Schedule 时把 Acitive 的勾去掉就好。

下面，就让我们来 Play 一下吧：

![](./assets/gitlab_pipelines.png)

> 我们还可以利用 **Settings -> CI / CD -> Pipeline triggers** 来给测试同学提供一个触发构建和部署的页面，如果他们有需要的话。

## 本地调试

所有脚本均可以在本机进行调试

cd 到项目根目录，分别输入以下命令试试

调试 ios 打包脚本

```
node ./ci/build ios
```

调试在 gitlab-ci.yml 中配置的任务，此时会注入一些 CI 环境变量

```
gitlab-runner exec shell build:ios
```
