const path = require('path')
const { capitalize, gitTag } = require('./utils')

// 文件服务器
const FILE_SERVER = process.env.FILE_SERVER || 'http://192.168.1.134:8000'
// 平台 android 或 ios
const PLATFORM = process.argv[2] || 'ios'

// 确保或假装在 CI 环境
process.env.CI = process.env.CI || 'true'

const ENABLE_HERMES = Boolean(process.env.ENABLE_HERMES || 'true')

const BUILD_TYPE = process.env.BUILD_TYPE || 'release'
process.env.BUILD_TYPE = BUILD_TYPE

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
const APPLICATION_ID = process.env.APPLICATION_ID || 'com.shundaojia.myapp'
process.env.APPLICATION_ID = APPLICATION_ID

// 版本名
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

// Android APK 原始目录
const APK_SOURCE_DIR = path.resolve(BUILD_DIR, `outputs/apk/${ENVIRONMENT}/release/`)

// Android js bundle 原始目录
const JS_BUNDLE_DIR = path.resolve(BUILD_DIR, `generated/assets/react/${ENVIRONMENT}/release/`)
// Android js source map 所在目录
const JS_SOURCE_MAP_DIR = path.resolve(BUILD_DIR, `generated/sourcemaps/react/${ENVIRONMENT}/release`)

// AndroidManifest.xml
const MANIFEST_FILENAME = 'AndroidManifest.xml'
// AndroidManifest.xml 原始路径
const MANIFEST_SOURCE_PATH = path.resolve(
  BUILD_DIR,
  `intermediates/merged_manifests/${ENVIRONMENT}Release/arm64-v8a/${MANIFEST_FILENAME}`,
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
const MAPPING_FILE_SOURCE_PATH = path.resolve(BUILD_DIR, `outputs/mapping/${ENVIRONMENT}Release/${MAPPING_FILENAME}`)

// package.json 所在目录
const REACT_ROOT = path.resolve(__dirname, '../')

// appcenter 上注册的 app 名字
const APP_NAME_CODEPUSH = process.env.APP_NAME_CODEPUSH || `listenzz/${APP_NAME.toLowerCase()}-${PLATFORM}`
// 热更新目标 https://docs.microsoft.com/en-us/appcenter/distribution/codepush/cli#target-binary-version-parameter
const APP_TARGET_CODEPUSH = process.env.APP_TARGET_CODEPUSH || VERSION_NAME
// 是否只需要打补丁包
const PATCH_ONLY = !!process.env.PATCH_ONLY
// 是否强制更新
const MANDATORY = !!process.env.MANDATORY

module.exports = {
  FILE_SERVER,
  PLATFORM,
  ENVIRONMENT,
  ENVIRONMENT_CAPITALIZE,
  ENABLE_HERMES,
  APP_NAME,
  APP_MODULE,
  APPLICATION_ID,
  VERSION_NAME,
  VERSION_CODE,
  BUILD_TYPE,
  ARTIFACTS_DIR,
  BUILD_DIR,
  APK_SOURCE_DIR,
  JS_BUNDLE_DIR,
  JS_SOURCE_MAP_DIR,
  MANIFEST_SOURCE_PATH,
  MANIFEST_FILENAME,
  SENTRY_PROPERTIES_PATH,
  SENTRY_DEBUG_META_SOURCE_PATH,
  SENTRY_DEBUG_META_FILENAME,
  MAPPING_FILE_SOURCE_PATH,
  MAPPING_FILENAME,
  REACT_ROOT,
  APP_NAME_CODEPUSH,
  APP_TARGET_CODEPUSH,
  PATCH_ONLY,
  MANDATORY,
}
