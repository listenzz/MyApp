const path = require('path')
const { sh, slack } = require('./utils')
const {
  ENVIRONMENT,
  PLATFORM,
  APP_NAME,
  APP_MODULE,
  VERSION_NAME,
  VERSION_CODE,
  BUILD_TYPE,
  FILE_SERVER,
  ARTIFACTS_DIR,
  BUGLY_DIST_URL,
  PATCH_ONLY,
} = require('./config')

if (PATCH_ONLY) {
  console.log('TODO:// 上传补丁包到文件服务器')
  process.exit(0)
}

if (PLATFORM === 'ios') {
  // -------------------------------ios-------------------------------------
  const workdir = process.env.IOS_DIR || path.resolve(__dirname, '../ios')
  if (process.env.SHOULD_RUBY_GEM_UPDATE === 'true') {
    sh(`gem install bundler && bundle install`, { cwd: workdir })
  }

  if (ENVIRONMENT === 'production') {
    sh('bundle exec fastlane upload_ipa_to_testflight', { cwd: workdir })
  } else {
    sh('bundle exec fastlane upload_ipa_to_bugly', { cwd: workdir })
    slack(`ios-${APP_NAME}-${ENVIRONMENT} 有新的版本了，${BUGLY_DIST_URL}`)
  }
  process.exit(0)
}

// -------------------------------android-------------------------------------
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

  console.info(`准备上传 ${filename}`)

  const result = sh(`curl -F file=@${apk} -F filename=${filename} ${FILE_SERVER}/${dest}`, {
    stdio: 'pipe',
    encoding: 'utf8',
  })

  try {
    console.info(`上传结果 ${result}`)
    const res = JSON.parse(result)
    if (res && res.success) {
    } else {
      process.exit(1)
    }
  } catch (e) {
    console.warn(e.message)
    process.exit(1)
  }
}
