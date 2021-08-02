const fs = require('fs')
const path = require('path')
const { sh, slack } = require('../utils')

const {
  ENVIRONMENT,
  PLATFORM,
  VERSION_NAME,
  ARTIFACTS_DIR,
  APPLICATION_ID,
  APP_MODULE,
  APP_NAME_CODEPUSH,
  APP_TARGET_CODEPUSH,
  REACT_ROOT,
  MANDATORY,
  ENABLE_HERMES,
} = require('../config')

if (ENABLE_HERMES) {
  const gradleFile = path.resolve(__dirname, `../../android/${APP_MODULE}/build.gradle`)
  if (!fs.existsSync(gradleFile)) {
    console.error(`找不到${gradleFile}文件，疑似路径错误，请修复`)
    process.exit(0)
  }
  let gradle = fs.readFileSync(gradleFile, 'utf8')
  gradle = gradle.replace('enableHermes: false', 'enableHermes: true')
  fs.writeFileSync(gradleFile, gradle)
}

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

// 合并 sourcemap
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

// 查看补丁部署情况
sh(`appcenter codepush deployment list -a ${APP_NAME_CODEPUSH}`)

// 发布 slack 通知
slack(
  `${PLATFORM}-${APPLICATION_ID}-${ENVIRONMENT}-${VERSION_NAME} 补丁包发布成功！本补丁对 ${APP_TARGET_CODEPUSH} 生效`,
)
