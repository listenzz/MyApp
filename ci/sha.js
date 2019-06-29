const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../app.json')
const data = fs.readFileSync(file, 'utf8')
const app = JSON.parse(data)
app.commit = (process.env.CI_COMMIT_SHA || 'xxxxxxxx').substr(0, 8)
fs.writeFileSync(file, JSON.stringify(app))
