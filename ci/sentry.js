const { PATCH_ONLY } = require('./config')

if (PATCH_ONLY) {
  require('./sentry/patch')
} else {
  require('./sentry/index')
}
