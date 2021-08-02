const path = require('path')
const fs = require('fs')
const { sh, slack, uploadFile } = require('../utils')
const {
  ENVIRONMENT,
  APP_NAME,
  VERSION_NAME,
  VERSION_CODE,
  FILE_SERVER,
  ARTIFACTS_DIR,
  APPLICATION_ID,
} = require('../config')

if (ENVIRONMENT === 'production') {
  const workdir = process.env.IOS_DIR || path.resolve(__dirname, '../../ios')
  if (process.env.SHOULD_RUBY_GEM_UPDATE === 'true') {
    sh(`gem install bundler && bundle install`, { cwd: workdir })
  }

  sh('bundle exec fastlane upload_ipa_to_testflight', { cwd: workdir })
} else {
  const file = path.join(ARTIFACTS_DIR, `${ENVIRONMENT}-${VERSION_NAME}-${VERSION_CODE}`)
  let filename = `${ENVIRONMENT}-${VERSION_NAME}-${VERSION_CODE}`

  if (process.env.CI_BUILD_REF_SLUG) {
    filename = `${process.env.CI_BUILD_REF_SLUG}-${ENVIRONMENT}-${VERSION_NAME}-${VERSION_CODE}`
  }
  const dest = `ios/${APP_NAME}/${ENVIRONMENT}/${VERSION_NAME}`

  const plist = fs
    .readFileSync(path.resolve(__dirname, '../template/ipa.plist'), 'utf8')
    .replace('{IpaUrl}', `${FILE_SERVER}/${dest}/${filename}.ipa`)
    .replace(/{IconUrl}/g, `${FILE_SERVER}/${APP_NAME}/${ENVIRONMENT}/icon.png`)
    .replace('{BundleIdentifier}', APPLICATION_ID)
    .replace('{BundleVersion}', VERSION_NAME)
    .replace('{AppName}', APP_NAME)

  fs.writeFileSync(`${file}.plist`, plist)

  const html = fs
    .readFileSync(path.resolve(__dirname, '../template/ipa.html'), 'utf8')
    .replace('{AppName}', APP_NAME)
    .replace('{PListUrl}', `${FILE_SERVER}/${dest}/${filename}.plist`)
    .replace('{AppVersion}', `${APP_NAME}-${filename}`)
    .replace('{HtmlUrl}', `${FILE_SERVER}/${dest}/${filename}.html`)
    .replace('{ServerUrl}', `${FILE_SERVER}/${dest}/`)
  fs.writeFileSync(`${file}.html`, html)

  uploadFile(`${file}.ipa`, `${filename}.ipa`, `${FILE_SERVER}/${dest}`)
  uploadFile(`${file}.plist`, `${filename}.plist`, `${FILE_SERVER}/${dest}`)
  uploadFile(`${file}.html`, `${filename}.html`, `${FILE_SERVER}/${dest}`)

  slack(`ios-${APP_NAME}-${ENVIRONMENT} 有新的版本了，${FILE_SERVER}/${dest}/${filename}.html`)
}
