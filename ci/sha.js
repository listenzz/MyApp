const fs = require('fs')
const path = require('path')
const { VERSION_NAME, VERSION_CODE } = require('./config')

const file = path.resolve(__dirname, '../app.json')
const data = fs.readFileSync(file, 'utf8')
const app = JSON.parse(data)
app.commit = process.env.CI_COMMIT_SHORT_SHA || 'xxxxxxxx'
app.version_name = VERSION_NAME
app.version_code = VERSION_CODE
fs.writeFileSync(file, JSON.stringify(app))
