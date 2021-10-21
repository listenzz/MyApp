const { sh, slack } = require('../../utils')

const {
  ENVIRONMENT,
  PLATFORM,
  VERSION_NAME,
  ARTIFACTS_DIR,
  APPLICATION_ID,
  APP_NAME_CODEPUSH,
  APP_TARGET_CODEPUSH,
  REACT_ROOT,
  MANDATORY,
} = require('../../config')

const deployment = ENVIRONMENT === 'production' ? 'Production' : 'Staging'
console.log('--------------------------------------------------------------------------')
console.log(`准备发布补丁: ${PLATFORM} ${ENVIRONMENT} ${APP_TARGET_CODEPUSH}`)
console.log('--------------------------------------------------------------------------')

// 发布补丁
sh(
  `appcenter codepush release-react \
    -a ${APP_NAME_CODEPUSH} \
    -t "${APP_TARGET_CODEPUSH}" \
    -o ${ARTIFACTS_DIR} \
    -d ${deployment} \
    -m ${MANDATORY} \
    --extra-bundler-option="--sourcemap-sources-root=${REACT_ROOT}"`,
)

// 查看补丁部署情况
sh(`appcenter codepush deployment list -a ${APP_NAME_CODEPUSH}`)

// 发布 slack 通知
slack(
  `${PLATFORM}-${APPLICATION_ID}-${ENVIRONMENT}-${VERSION_NAME} 补丁包发布成功！本补丁对 ${APP_TARGET_CODEPUSH} 生效`,
)
