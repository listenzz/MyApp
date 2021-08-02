const { sh } = require('../utils')
const {
  APPLICATION_ID,
  PLATFORM,
  VERSION_NAME,
  VERSION_CODE,
  ARTIFACTS_DIR,
  SENTRY_PROPERTIES_PATH,
  ENVIRONMENT,
  APP_NAME_CODEPUSH,
} = require('../config')

const deployment = ENVIRONMENT === 'production' ? 'Production' : 'Staging'
const release = `${APPLICATION_ID}@${VERSION_NAME}+${VERSION_CODE}`

// 上传 sourcemap 到 sentry
sh(
  `sentry-cli react-native appcenter \
    --log-level INFO \
    --release-name ${release} \
    --dist ${VERSION_CODE} \
    --deployment ${deployment} \
    ${APP_NAME_CODEPUSH} ${PLATFORM} ${ARTIFACTS_DIR}/CodePush`,
  {
    env: { ...process.env, SENTRY_PROPERTIES: SENTRY_PROPERTIES_PATH },
  },
)
