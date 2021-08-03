const { PLATFORM } = require('../../config')

if (PLATFORM === 'ios') {
  require('./ios')
} else {
  require('./android')
}
