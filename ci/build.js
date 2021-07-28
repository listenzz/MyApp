const path = require('path')
const fs = require('fs')
const { sh, slack, copy } = require('./utils')
const { COPYFILE_EXCL } = fs.constants

const {
  ENVIRONMENT,
  ENVIRONMENT_CAPITALIZE,
  PLATFORM,
  APP_MODULE,
  VERSION_NAME,
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
  APPLICATION_ID,
  APP_NAME_CODEPUSH,
  APP_TARGET_CODEPUSH,
  REACT_ROOT,
  PATCH_ONLY,
  MANDATORY,
  ENABLE_HERMES,
} = require('./config')

if (ENABLE_HERMES) {
  if (PLATFORM === 'android') {
    const gradleFile = path.resolve(__dirname, `../android/${APP_MODULE}/build.gradle`)
    if (!fs.existsSync(gradleFile)) {
      console.error(`找不到${gradleFile}文件，疑似路径错误，请修复`)
      process.exit(0)
    }
    let gradle = fs.readFileSync(gradleFile, 'utf8')
    gradle = gradle.replace('enableHermes: false', 'enableHermes: true')
    fs.writeFileSync(gradleFile, gradle)
  }
}

// ------------------------------- patch -------------------------------------
if (PATCH_ONLY) {
  const deployment = ENVIRONMENT === 'production' ? 'Production' : 'Staging'
  console.log('--------------------------------------------------------------------------')
  console.log(`准备发布补丁: ${PLATFORM} ${ENVIRONMENT} ${APP_TARGET_CODEPUSH}`)
  console.log('--------------------------------------------------------------------------')

  // 发布补丁
  // appcenter-cli 根据 build.gradle 文件中是否含有字符串 “enableHermes: true” 来判断是否开启 hermes
  sh(
    `appcenter codepush release-react \
      -a ${APP_NAME_CODEPUSH} \
      -t "${APP_TARGET_CODEPUSH}" \
      -o ${ARTIFACTS_DIR} \
      -d ${deployment} \
      -m ${MANDATORY} \
      --extra-bundler-option="--sourcemap-sources-root=${REACT_ROOT}"`,
  )

  if (PLATFORM === 'android') {
    // https://github.com/getsentry/sentry-react-native/issues/761#issuecomment-587498344
    const packagerMap = `${ARTIFACTS_DIR}/CodePush/index.android.bundle.map`
    const compilerMap = `${ARTIFACTS_DIR}/CodePush/index.android.bundle.hbc.map`
    const sourceMap = `${ARTIFACTS_DIR}/CodePush/index.android.bundle.map`
    if (fs.existsSync(compilerMap)) {
      console.info(`由于开启了 hermes，接下来合并 sourcemap.`)
      sh(`node node_modules/react-native/scripts/compose-source-maps.js ${packagerMap} ${compilerMap} -o ${sourceMap}`)
      console.info(`sourcemap 合并成功，删除多余的文件`)
      sh(`rm ${compilerMap}`)
    }
  }

  // 查看补丁部署情况
  sh(`appcenter codepush deployment list -a ${APP_NAME_CODEPUSH}`)

  // 发布 slack 通知
  slack(
    `${PLATFORM}-${APPLICATION_ID}-${ENVIRONMENT}-${VERSION_NAME} 补丁包发布成功！本补丁对 ${APP_TARGET_CODEPUSH} 生效`,
  )
  process.exit(0)
}

// ------------------------------- ios -------------------------------------
if (PLATFORM === 'ios') {
  const workdir = process.env.IOS_DIR || path.resolve(__dirname, '../ios')
  if (process.env.SHOULD_RUBY_GEM_UPDATE === 'true') {
    sh(`gem install bundler && bundle install`, { cwd: workdir })
  }
  sh('bundle exec fastlane build', { cwd: workdir })
  process.exit(0)
}

// ------------------------------- android -------------------------------------
// 打基础包
const workdir = process.env.ANDROID_DIR || path.resolve(__dirname, '../android')
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
