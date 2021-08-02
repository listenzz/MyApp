const { PLATFORM, PATCH_ONLY } = require('../config')

if (PATCH_ONLY) {
  console.log('TODO:// 上传补丁包到文件服务器')
  process.exit(0)
}

if (PLATFORM === 'ios') {
  require('./ios')
} else {
  require('./android')
}
