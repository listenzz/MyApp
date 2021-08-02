const path = require('path')
const { sh } = require('../utils')

const workdir = process.env.IOS_DIR || path.resolve(__dirname, '../../ios')
if (process.env.SHOULD_RUBY_GEM_UPDATE === 'true') {
  sh(`gem install bundler && bundle install`, { cwd: workdir })
}
sh('bundle exec fastlane build', { cwd: workdir })
