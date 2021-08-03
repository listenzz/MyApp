const path = require('path')
const { sh } = require('../utils')
const { REACT_ROOT } = require('../config')

const workdir = process.env.IOS_DIR || path.join(REACT_ROOT, 'ios')

if (process.env.SHOULD_RUBY_GEM_UPDATE === 'true') {
  sh(`gem install bundler && bundle install`, { cwd: workdir })
}
sh('bundle exec fastlane build', { cwd: workdir })
