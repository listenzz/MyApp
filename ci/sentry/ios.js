const path = require('path')
const { sh } = require('../utils')
const { SENTRY_PROPERTIES_PATH } = require('../config')

const workdir = process.env.IOS_DIR || path.resolve(__dirname, '../../ios')

if (process.env.SHOULD_RUBY_GEM_UPDATE === 'true') {
  sh(`gem install bundler && bundle install`, { cwd: workdir })
}

sh('bundle exec fastlane upload_debug_symbol_to_sentry', {
  env: {
    ...process.env,
    SENTRY_PROPERTIES: SENTRY_PROPERTIES_PATH,
  },
  cwd: workdir,
})
