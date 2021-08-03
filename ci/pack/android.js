const path = require('path')
const fs = require('fs')
const { sh, copy } = require('../utils')
const { COPYFILE_EXCL } = fs.constants

const {
  ENVIRONMENT_CAPITALIZE,
  APP_MODULE,
  ARTIFACTS_DIR,
  APK_SOURCE_DIR,
  JS_BUNDLE_DIR,
  JS_SOURCE_MAP_DIR,
  MANIFEST_SOURCE_PATH,
  MANIFEST_FILENAME,
  SENTRY_DEBUG_META_SOURCE_PATH,
  SENTRY_DEBUG_META_FILENAME,
  MAPPING_FILE_SOURCE_PATH,
  MAPPING_FILENAME,
  ENABLE_HERMES,
  REACT_ROOT,
} = require('../config')

if (ENABLE_HERMES) {
  const gradleFile = path.join(REACT_ROOT, `android/${APP_MODULE}/build.gradle`)
  if (!fs.existsSync(gradleFile)) {
    console.error(`找不到${gradleFile}文件，疑似路径错误，请修复`)
    process.exit(0)
  }
  let gradle = fs.readFileSync(gradleFile, 'utf8')
  gradle = gradle.replace('enableHermes: false', 'enableHermes: true')
  fs.writeFileSync(gradleFile, gradle)
}

const workdir = process.env.ANDROID_DIR || path.join(REACT_ROOT, 'android')

// 打包
sh(`./gradlew assemble${ENVIRONMENT_CAPITALIZE}Release`, { cwd: workdir })

// 整理制品
// Android 构建会产生许多中间物，它们都保存在 build 文件夹中，
// 我们需要抽取需要的文件，保存到指定目录让 CI 作为 artifacts 上传
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR)
}

// apk
copy(APK_SOURCE_DIR, ARTIFACTS_DIR)

// jsBundleFile
copy(JS_BUNDLE_DIR, ARTIFACTS_DIR)

// jsSourceMapFile
copy(JS_SOURCE_MAP_DIR, ARTIFACTS_DIR)

// AndroidManifest.xml
fs.copyFileSync(MANIFEST_SOURCE_PATH, path.resolve(ARTIFACTS_DIR, MANIFEST_FILENAME), COPYFILE_EXCL)

// sentry-debug-meta.properties
fs.copyFileSync(SENTRY_DEBUG_META_SOURCE_PATH, path.resolve(ARTIFACTS_DIR, SENTRY_DEBUG_META_FILENAME), COPYFILE_EXCL)

// mapping.txt
fs.copyFileSync(MAPPING_FILE_SOURCE_PATH, path.resolve(ARTIFACTS_DIR, MAPPING_FILENAME), COPYFILE_EXCL)
