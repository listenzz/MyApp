const path = require('path')
const fs = require('fs')
const { sh, slack, copy } = require('./utils')
const { COPYFILE_EXCL } = fs.constants

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
  REACT_ROOT,
  PATCH_ONLY,
  MANDATORY,
} = require('./config')

// ------------------------------- patch -------------------------------------
if (PATCH_ONLY) {
  const deployment = ENVIRONMENT === 'production' ? 'Production' : 'Staging'
  console.log('--------------------------------------------------------------------------')
  console.log(`准备发布补丁: ${PLATFORM} ${ENVIRONMENT} ${VERSION_NAME}`)
  console.log('--------------------------------------------------------------------------')

  // 设置当前要操作的 app
  sh(`appcenter apps set-current ${APP_NAME_CODEPUSH}`)

  // 发布补丁
  sh(
    `appcenter codepush release-react -t ${VERSION_NAME} -o ${ARTIFACTS_DIR} -d ${deployment} -m ${MANDATORY} \
      --extra-bundler-option="--sourcemap-sources-root=${REACT_ROOT}"`,
  )
  // 查看补丁部署情况
  sh('appcenter codepush deployment list')

  // 发布 slack 通知
  slack(`${PLATFORM}-${APPLICATION_ID}-${ENVIRONMENT}-${VERSION_NAME} 补丁包发布成功！`)
  process.exit(0)
}

// ------------------------------- ios -------------------------------------
if (PLATFORM === 'ios') {
  const workdir = process.env.IOS_DIR || path.resolve(__dirname, '../ios')
  sh('bundle exec fastlane build', undefined, workdir)
  process.exit(0)
}

// ------------------------------- android -------------------------------------
// 打基础包
const workdir = process.env.ANDROID_DIR || path.resolve(__dirname, '../android')
sh(`./gradlew assemble${ENVIRONMENT_CAPITALIZE}Release`, undefined, workdir)

// 打渠道包
if (NEED_TO_BUILD_CHANNELS) {
  sh('./gradlew rebuildChannel', undefined, workdir)

  const { path7za } = require('7zip-bin')
  const { execSync } = require('child_process')

  /**
   * 为了避免执行 yarn install, 不适合放到 utils 中，因为有 7zip-bin 依赖
   * @param {string} dir
   * @param {string} path
   */
  function compress(dir, path) {
    const cmd = `${path7za} a ${path} ${dir}`.replace('\n', '')
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

// jsBundleFile
copy(JS_BUNDLE_DIR, ARTIFACTS_DIR)

// jsSourceMapFile
copy(JS_SOURCE_MAP_DIR, ARTIFACTS_DIR)

// AndroidManifest.xml
fs.copyFileSync(MANIFEST_SOURCE_PATH, path.resolve(ARTIFACTS_DIR, MANIFEST_FILENAME), COPYFILE_EXCL)

// sentry-debug-meta.properties
if (fs.existsSync(SENTRY_DEBUG_META_SOURCE_PATH)) {
  fs.copyFileSync(SENTRY_DEBUG_META_SOURCE_PATH, path.resolve(ARTIFACTS_DIR, SENTRY_DEBUG_META_FILENAME), COPYFILE_EXCL)
}

// mapping.txt
fs.copyFileSync(MAPPING_FILE_SOURCE_PATH, path.resolve(ARTIFACTS_DIR, MAPPING_FILENAME), COPYFILE_EXCL)
