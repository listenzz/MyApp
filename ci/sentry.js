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
  ENVIRONMENT,
  PATCH_ONLY,
  APP_NAME_CODEPUSH,
} = require('./config')

if (PATCH_ONLY) {
  const deployment = ENVIRONMENT === 'production' ? 'Production' : 'Staging'

  // 设置当前要操作的 app
  sh(`appcenter apps set-current ${APP_NAME_CODEPUSH}`)

  // 上传 sourcemap 到 sentry
  sh(
    `sentry-cli react-native appcenter \
      --bundle-id ${APPLICATION_ID}-${VERSION_NAME} \
      --deployment ${deployment} ${APP_NAME_CODEPUSH} ${PLATFORM} ${ARTIFACTS_DIR}/CodePush`,
    { ...process.env, SENTRY_PROPERTIES: SENTRY_PROPERTIES_PATH },
  )
  process.exit(0)
}

if (PLATFORM === 'ios') {
  // -------------------------------ios-------------------------------------
  const workdir = process.env.IOS_DIR || path.resolve(__dirname, '../ios')
  sh(
    'bundle exec fastlane upload_debug_symbol_to_sentry',
    { ...process.env, SENTRY_PROPERTIES: SENTRY_PROPERTIES_PATH },
    workdir,
  )
  process.exit(0)
}

// -------------------------------android-------------------------------------
const release = `${APPLICATION_ID}-${VERSION_NAME}`
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
