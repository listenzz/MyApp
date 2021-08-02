const { sh } = require('../utils')
const {
  APPLICATION_ID,
  VERSION_NAME,
  VERSION_CODE,
  ARTIFACTS_DIR,
  MANIFEST_FILENAME,
  MAPPING_FILENAME,
  SENTRY_PROPERTIES_PATH,
  SENTRY_DEBUG_META_FILENAME,
} = require('../config')

const release = `${APPLICATION_ID}@${VERSION_NAME}+${VERSION_CODE}`

// 上传 js bundle map 文件
sh(
  `sentry-cli --log-level INFO react-native gradle \
    --bundle ${ARTIFACTS_DIR}/index.android.bundle \
    --sourcemap ${ARTIFACTS_DIR}/index.android.bundle.map \
    --release ${release} \
    --dist ${VERSION_CODE}`,
  {
    env: { ...process.env, SENTRY_PROPERTIES: SENTRY_PROPERTIES_PATH },
  },
)

// 上传 java 符号表
sh(
  `sentry-cli --log-level INFO upload-proguard \
    --android-manifest ${ARTIFACTS_DIR}/${MANIFEST_FILENAME} \
    --write-properties ${ARTIFACTS_DIR}/${SENTRY_DEBUG_META_FILENAME} ${ARTIFACTS_DIR}/${MAPPING_FILENAME}`,
  {
    env: { ...process.env, SENTRY_PROPERTIES: SENTRY_PROPERTIES_PATH },
  },
)
