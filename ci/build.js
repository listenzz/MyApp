const { PATCH_ONLY } = require('./config')

if (PATCH_ONLY) {
  require('./patch')
} else {
  require('./pack')
}
