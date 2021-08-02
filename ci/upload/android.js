const path = require('path')
const { slack, uploadFile } = require('../utils')
const {
  ENVIRONMENT,
  APP_NAME,
  APP_MODULE,
  VERSION_NAME,
  VERSION_CODE,
  BUILD_TYPE,
  FILE_SERVER,
  ARTIFACTS_DIR,
} = require('../config')

const dest = `android/${APP_NAME}/${ENVIRONMENT}/${VERSION_NAME}`

// 上传 apk 基础包
uploadApk('universal')

if (ENVIRONMENT === 'production') {
  uploadApk('arm64-v8a')
  uploadApk('armeabi-v7a')
}

// 发布 slack 通知
slack(`android-${APP_NAME}-${ENVIRONMENT} 有新的版本了，${FILE_SERVER}/${dest}`)

function uploadApk(abi) {
  const apk = path.join(ARTIFACTS_DIR, `${APP_MODULE}-${ENVIRONMENT}-${abi}-${BUILD_TYPE}.apk`)
  let filename = `${APP_NAME}-${ENVIRONMENT}-${abi}-${BUILD_TYPE}-${VERSION_NAME}-${VERSION_CODE}.apk`

  if (process.env.CI_BUILD_REF_SLUG) {
    filename = `${APP_NAME}-${process.env.CI_BUILD_REF_SLUG}-${ENVIRONMENT}-${abi}-${BUILD_TYPE}-${VERSION_NAME}-${VERSION_CODE}.apk`
  }

  uploadFile(apk, filename, `${FILE_SERVER}/${dest}`)
}
