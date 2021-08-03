const { PLATFORM, PATCH_ONLY } = require('../config')

if (PATCH_ONLY) {
  require('./patch')
} else if (PLATFORM === 'ios') {
  require('./ios')
} else {
  require('./android')
}
