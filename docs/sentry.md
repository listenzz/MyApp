Sentry 是一款开源的崩溃监控工具，可帮助开发人员实时监控和修复导致应用崩溃的 BUG。最重要的是，它同时支持对原生代码和 React Native 代码的监控。

> Sentry 可私有部署

本文讲述如何将 [Sentry](https://sentry.io/welcome/) 和 **CI / CD** 集成。

- 在打包时注入 Commit SHA，方便我们 checkout 出问题的代码
- 上传符号表（RN - jsbundle.map, iOS - dSYM, Android - mapping.txt）

## 安装 sentry-cli

```
curl -sL https://sentry.io/get-cli/ | bash
```

> 本文使用的 sentry-cli 版本已经更新到 1.58.0 以上，使用 sentry-cli update 命令即可升级 sentry-cli

## 登录和创建 Sentry Project

登录（省略一百个字）

创建 Sentry Project

1. 打开 All 选项卡，选择 **React-Native**

![](./assets/sentry_create.png)

2. 更改项目名, 并点击 **Create Projec**

![](./assets/sentry_create_2.jpg)

3. 根据官方指南，[安装 @sentry/react-native](https://docs.sentry.io/platforms/react-native/)

## 调整 iOS 项目

- 删除 **Upload Debug Symbols to Sentry** 这个 Build Phase

![](./assets/sentry_ios_delete_upload_debug_symbols.jpg)

- 展开 **Bundle React Native code and images** 这个 Build Phase，将里面的脚本替换成如下内容

![](./assets/sentry_shell.png)

```shell
if [ -z "$CI" ]; then
export NODE_BINARY=node
../node_modules/react-native/scripts/react-native-xcode.sh
else
export NODE_BINARY=node
sourcemap_path="$SRCROOT/build/main.jsbundle.map"
sourcemap_sources_root="$SRCROOT/../"
export EXTRA_PACKAGER_ARGS="--sourcemap-output $sourcemap_path --sourcemap-sources-root $sourcemap_sources_root"
echo $EXTRA_PACKAGER_ARGS >&2
../node_modules/react-native/scripts/react-native-xcode.sh

bundle_path="$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/main.jsbundle"
build_dir="$SRCROOT/build"
if [ -e "$bundle_path" ]; then
cp "$bundle_path" "$build_dir"
else
echo "可能 ts 代码有错误，无法通过编译。"
exit 3
fi
fi
```

- 修改 ios/fastlane/Fastfile 文件，添加一个 lane

```ruby
lane :upload_debug_symbol_to_sentry do |options|

  file_name, basename, version_name, build_number, dir_name = app_info

  bundle_output = "#{ENV['PWD']}/build/main.jsbundle"
  sourcemap_output = "#{ENV['PWD']}/build/main.jsbundle.map"
  release = "#{app_identifier}@#{version_name}+#{build_number}"

  sh(%(
      sentry-cli --log-level INFO releases new #{release}
  ))

  # upload_sourcemaps
  sh(%(
      sentry-cli --log-level INFO releases files #{release} upload-sourcemaps --dist #{build_number} --rewrite #{sourcemap_output}
  ))

  # upload_bundle
  sh(%(
      sentry-cli --log-level INFO releases files #{release} upload --dist #{build_number} #{bundle_output} "~/main.jsbundle"
  ))

  sh(%(sentry-cli releases finalize #{release}))

  # upload_sdym
  sh(%(
      sentry-cli --log-level INFO upload-dif -t dsym --no-bin #{dir_name}
  ))
end
```

## 调整 Android 项目

- 修改 android/sentry.properties

```diff
- cli.executable=node_modules/@sentry/cli/bin/sentry-cli
```

- 修改 android/build.gradle 文件

```diff
buildscript {
    dependencies {
+       classpath 'io.sentry:sentry-android-gradle-plugin:1.7.36'
    }
}
```

- 修改 anroid/app/build.gradle 文件

```diff
+ apply plugin: 'io.sentry.android.gradle'
- apply from: "../../node_modules/@sentry/react-native/sentry.gradle"

+ sentry {
+    uploadNativeSymbols false
+    autoUpload false
+ }
```

## 调整 js 代码

- 修改 app.json 文件

```js
{
  "name": "MyApp",
  "displayName": "MyApp",
  "COMMIT_SHORT_SHA": "xxxxxxxx",
  "VERSION_NAME": "1.0.0",
  "VERSION_CODE": 1,
  "CI": false
}
```

- 修改 AppInfo.ts 文件

`VERSION_NAME` 和 `VERSION_CODE` 不再通过桥接原生的方式获取，而是通过环境变量

```ts
export { VERSION_NAME, VERSION_CODE, COMMIT_SHORT_SHA, CI } from '../app.json'
```

- 修改 index.js 文件

Sentry 项目创建成功后，会打开一个安装引导页面，将该页面拖到底部，拷贝如下代码到你的 index.js 文件中

![](./assets/sentry_client_configuration.png)

```js
// index.js
import { AppRegistry } from 'react-native'
import App from './App'
import {
  ENVIRONMENT,
  APPLICATION_ID,
  VERSION_NAME,
  VERSION_CODE,
  COMMIT_SHORT_SHA,
  CI,
} from './app/AppInfo'
import * as Sentry from '@sentry/react-native'

if (CI) {
  Sentry.init({
    dsn: 'https://2d17bb1ffde34fec963d29b4c3a29f99@sentry.io/1446147',
    enableAutoSessionTracking: true,
    environment: ENVIRONMENT,
    release: `${APPLICATION_ID}@${VERSION_NAME}+${VERSION_CODE}`,
    dist: `${VERSION_CODE}`,
  })

  Sentry.setTag('commit', COMMIT_SHORT_SHA)
}

AppRegistry.registerComponent(appName, () => App)
```

- 修改 App.tsx 文件，添加一些能导致崩溃的代码

```tsx
// App.tsx
import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import * as Sentry from '@sentry/react-native'
import { Navigator, withNavigationItem, InjectedProps } from 'react-native-navigation-hybrid'
import { ENVIRONMENT, VERSION_NAME, VERSION_CODE, COMMIT_SHORT_SHA } from './AppInfo'

export default withNavigationItem({
  rightBarButtonItem: {
    icon: Image.resolveAssetSource(require('./images/ic_settings.png')),
    action: (navigator: Navigator) => {
      navigator.push('Blank')
    },
  },
})(App)

function App({ sceneId }: InjectedProps) {
  const version = `${VERSION_NAME}-${VERSION_CODE}`

  function sentryNativeCrash() {
    Sentry.nativeCrash()
  }

  function jsCrash() {
    const array = ['x', 'y', 'z', 'a']
    const a = array[9].length + 8
    console.log(`${Number(a) + 1}`)
  }

  function throwError() {
    throw new Error('主动抛出异常')
  }

  function reject() {
    Promise.reject(new Error('promise 被拒绝了'))
  }

  return (
    <View style={[styles.container]}>
      <Text style={styles.welcome}>
        环境: {`${ENVIRONMENT}`} 版本: {version} commit: {COMMIT_SHORT_SHA}
      </Text>
      <Text style={styles.welcome}>按下一个按钮，让 APP 崩溃!</Text>

      <TouchableOpacity onPress={sentryNativeCrash} activeOpacity={0.2} style={styles.button}>
        <Text style={styles.buttonText}>Sentry native crash</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={jsCrash} activeOpacity={0.2} style={styles.button}>
        <Text style={styles.buttonText}>数组越界</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={throwError} activeOpacity={0.2} style={styles.button}>
        <Text style={styles.buttonText}>主动抛出异常</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={reject} activeOpacity={0.2} style={styles.button}>
        <Text style={styles.buttonText}>promise reject</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 16,
  },
  welcome: {
    backgroundColor: 'transparent',
    fontSize: 17,
    textAlign: 'center',
    margin: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },

  buttonText: {
    backgroundColor: 'transparent',
    color: 'rgb(34,88,220)',
  },
})
```

## 修改 CI 脚本

- 注入 Commit SHA

在 ci 文件夹中添加 sha.js 文件

```js
// sha.js
const fs = require('fs')
const path = require('path')
const { VERSION_NAME, VERSION_CODE, CI } = require('./config')

const file = path.resolve(__dirname, '../app.json')
const data = fs.readFileSync(file, 'utf8')
const app = JSON.parse(data)
app.COMMIT_SHORT_SHA = process.env.CI_COMMIT_SHORT_SHA || 'xxxxxxxx'
app.VERSION_NAME = VERSION_NAME
app.VERSION_CODE = VERSION_CODE
app.CI = !!process.env.CI
fs.writeFileSync(file, JSON.stringify(app))
```

- 修改 ci/config.js 文件，添加若干常量

```js
// config.js
// Android js bundle 原始目录
const JS_BUNDLE_SOURCE_DIR = path.resolve(
  BUILD_DIR,
  `generated/assets/react/${ENVIRONMENT}/release/`,
)

// AndroidManifest.xml
const MANIFEST_FILENAME = 'AndroidManifest.xml'
// AndroidManifest.xml 原始路径
const MANIFEST_SOURCE_PATH = path.resolve(
  BUILD_DIR,
  `intermediates/merged_manifests/${ENVIRONMENT}Release/armeabi-v7a/${MANIFEST_FILENAME}`,
)

// sentry properties 所在路径
const SENTRY_PROPERTIES_PATH = path.resolve(__dirname, `../${PLATFORM}/sentry.properties`)
const SENTRY_DEBUG_META_FILENAME = 'sentry-debug-meta.properties'
// sentry-debug-meta.properties 原始路径
const SENTRY_DEBUG_META_SOURCE_PATH = path.resolve(
  BUILD_DIR,
  `intermediates/merged_assets/${ENVIRONMENT}Release/out/${SENTRY_DEBUG_META_FILENAME}`,
)

const MAPPING_FILENAME = 'mapping.txt'
// android mapping.txt 原始路径
const MAPPING_FILE_SOURCE_PATH = path.resolve(
  BUILD_DIR,
  `outputs/mapping/${ENVIRONMENT}/release/${MAPPING_FILENAME}`,
)
```

- 修改 ci/build.js 文件，在文件末尾增加如下内容

```js
// ci/build.js
// jsbundle
copy(JS_BUNDLE_SOURCE_DIR, ARTIFACTS_DIR)

// AndroidManifest.xml
fs.copyFileSync(MANIFEST_SOURCE_PATH, path.resolve(ARTIFACTS_DIR, MANIFEST_FILENAME), COPYFILE_EXCL)

// sentry-debug-meta.properties
fs.copyFileSync(
  SENTRY_DEBUG_META_SOURCE_PATH,
  path.resolve(ARTIFACTS_DIR, SENTRY_DEBUG_META_FILENAME),
  COPYFILE_EXCL,
)

// mapping.txt
fs.copyFileSync(
  MAPPING_FILE_SOURCE_PATH,
  path.resolve(ARTIFACTS_DIR, MAPPING_FILENAME),
  COPYFILE_EXCL,
)
```

- 创建 ci/sentry.js 文件

```js
// ci/sentry.js
const path = require('path')
const { sh } = require('./utils')
const {
  APPLICATION_ID,
  PLATFORM,
  VERSION_NAME,
  VERSION_CODE,
  ARTIFACTS_DIR,
  SENTRY_PROPERTIES_PATH,
  MANIFEST_FILENAME,
  MAPPING_FILENAME,
  SENTRY_DEBUG_META_FILENAME,
} = require('./config')

const release = `${APPLICATION_ID}@${VERSION_NAME}+${VERSION_CODE}`

if (PLATFORM === 'ios') {
  // -------------------------------ios-------------------------------------
  const workdir = process.env.IOS_DIR || path.resolve(__dirname, '../ios')
  sh(
    `bundle exec fastlane upload_debug_symbol_to_sentry`,
    { ...process.env, SENTRY_PROPERTIES: SENTRY_PROPERTIES_PATH },
    workdir,
  )
  process.exit(0)
}

// -------------------------------android-------------------------------------
// 上传 js bundle map 文件
sh(
  `sentry-cli --log-level INFO react-native gradle \
    --bundle ${ARTIFACTS_DIR}/index.android.bundle \
    --sourcemap ${ARTIFACTS_DIR}/index.android.bundle.map \
    --release ${release} \
    --dist ${VERSION_CODE}`,
  { ...process.env, SENTRY_PROPERTIES: SENTRY_PROPERTIES_PATH },
)

// 上传 java 符号表
sh(
  `sentry-cli --log-level INFO upload-proguard \
    --android-manifest ${ARTIFACTS_DIR}/${MANIFEST_FILENAME} \
    --write-properties ${ARTIFACTS_DIR}/${SENTRY_DEBUG_META_FILENAME} ${ARTIFACTS_DIR}/${MAPPING_FILENAME}`,
  { ...process.env, SENTRY_PROPERTIES: SENTRY_PROPERTIES_PATH },
)
```

- 修改 .gitlab-ci.yml 文件，修改两个 job，添加两个 job，这是修改后的样子：

```yml
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
    - node ./ci/sha.js
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

deploy:ios:sentry:
  stage: deploy
  dependencies:
    - build:ios
  script:
    - node ./ci/sentry.js ios
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
    - node ./ci/sha.js
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

deploy:android:sentry:
  stage: deploy
  dependencies:
    - build:android
  script:
    - node ./ci/sentry.js android
  allow_failure: true
  only:
    - schedules
  tags:
    - android
  except:
    variables:
      - $IOS_ONLY
```

## 测试

至此，我们已经集成了 Sentry，并实现通过 CI 打包时，将会上传符号表到 Sentry，现在就让我们上传代码到 GitLab，点击 Play 按钮打个包来测试一下吧。

一旦发生异常，Sentry 将收到报告，不仅定位到了出错的地方，还附带 Breadcrumbs，即崩溃前的日志。

![](./assets/sentry_error_report.png)

我们可以在 TAGS 一栏中找到 commit 和 environment，这正是我们通过以下代码所设置的

```js
Sentry.init({
  environment: ENVIRONMENT,
})

Sentry.setTag('commit', COMMIT_SHORT_SHA)
```

environment 可以告诉我们，是哪个环境出了问题，commit 可以告诉我们，是基于那个 commit 打的包出了问题，方便我们 checkout 出问题的代码。
