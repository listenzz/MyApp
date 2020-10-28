const fs = require('fs')
const path = require('path')
const { VERSION_NAME, VERSION_CODE, CI } = require('./config')

const file = path.resolve(__dirname, '../app.json')
const data = fs.readFileSync(file, 'utf8')
const app = JSON.parse(data)
app.COMMIT_SHORT_SHA = process.env.CI_COMMIT_SHORT_SHA || 'xxxxxxxx'
app.VERSION_NAME = VERSION_NAME
app.VERSION_CODE = VERSION_CODE
app.CI = !!process.env.CI
fs.writeFileSync(file, JSON.stringify(app))
