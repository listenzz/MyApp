const path = require('path')
const fs = require('fs')
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
  APPLICATION_ID,
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
    if (process.env.BUGLY_ENABLED === 'true') {
      const result = sh('bundle exec fastlane upload_ipa_to_bugly', { cwd: workdir, stdio: 'pipe', encoding: 'utf8' })
      console.log(result)
      if (result.includes('"rtcode":0')) {
        slack(`ios-${APP_NAME}-${ENVIRONMENT} 有新的版本了，${BUGLY_DIST_URL}`)
      } else {
        console.log('%c上传到 bugly 失败', 'color:"#FF4444"; font-size:24px')
        process.exit(1)
      }
    } else {
      const file = path.join(ARTIFACTS_DIR, `${ENVIRONMENT}-${VERSION_NAME}-${VERSION_CODE}`)
      let filename = `${ENVIRONMENT}-${VERSION_NAME}-${VERSION_CODE}`

      if (process.env.CI_BUILD_REF_SLUG) {
        filename = `${process.env.CI_BUILD_REF_SLUG}-${ENVIRONMENT}-${VERSION_NAME}-${VERSION_CODE}`
      }
      const dest = `ios/${APP_NAME}/${ENVIRONMENT}/${VERSION_NAME}`

      const plist = fs
        .readFileSync(path.resolve(__dirname, './template/ipa.plist'), 'utf8')
        .replace('{IpaUrl}', `${FILE_SERVER}/${dest}/${filename}.ipa`)
        .replace(/{IconUrl}/g, `${FILE_SERVER}/${APP_NAME}/${ENVIRONMENT}/icon.png`)
        .replace('{BundleIdentifier}', APPLICATION_ID)
        .replace('{BundleVersion}', VERSION_NAME)
        .replace('{AppName}', APP_NAME)

      fs.writeFileSync(`${file}.plist`, plist)

      const html = fs
        .readFileSync(path.resolve(__dirname, './template/ipa.html'), 'utf8')
        .replace('{AppName}', APP_NAME)
        .replace('{PListUrl}', `${FILE_SERVER}/${dest}/${filename}.plist`)
        .replace('{AppVersion}', `${APP_NAME}-${filename}`)
        .replace('{HtmlUrl}', `${FILE_SERVER}/${dest}/${filename}.html`)
        .replace('{ServerUrl}', `${FILE_SERVER}/${dest}/`)
      fs.writeFileSync(`${file}.html`, html)

      uploadFile(`${file}.ipa`, `${filename}.ipa`, dest)
      uploadFile(`${file}.plist`, `${filename}.plist`, dest)
      uploadFile(`${file}.html`, `${filename}.html`, dest)

      slack(`ios-${APP_NAME}-${ENVIRONMENT} 有新的版本了，${FILE_SERVER}/${dest}/${filename}.html`)

      function uploadFile(file, filename, dest) {
        console.info(`准备上传 ${filename}`)

        const result = sh(`curl -F file=@${file} -F filename=${filename} ${FILE_SERVER}/${dest}`, {
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
    }
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
