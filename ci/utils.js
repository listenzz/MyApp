const fs = require('fs')
const path = require('path')
const { spawnSync, execSync } = require('child_process')

// 不适合放在 config.js 会引起循环依赖
const SLACK_WEB_HOOK_URL =
  process.env.SLACK_WEB_HOOK_URL || 'https://hooks.slack.com/services/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'

/**
 *
 * @param {string} src
 * @param {string} dist
 */
function copy(src, dist) {
  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist)
  }
  const files = fs.readdirSync(src)
  files.forEach(file => {
    const srcFile = path.join(src, file)
    const distFile = path.join(dist, file)
    const stats = fs.statSync(srcFile)
    if (stats.isFile()) {
      const read = fs.createReadStream(srcFile)
      const write = fs.createWriteStream(distFile)
      read.pipe(write)
    } else if (stats.isDirectory()) {
      copy(srcFile, distFile)
    }
  })
}

function uploadFile(file, filename, dest) {
  console.info(`准备上传 ${filename}`)

  const result = sh(`curl -F file=@${file} -F filename=${filename} ${dest}`, {
    stdio: 'pipe',
    encoding: 'utf8',
  })

  try {
    console.info(`上传结果 ${result}`)
    const res = JSON.parse(result)
    if (res && res.success) {
    } else {
      process.exit(1)
    }
  } catch (e) {
    console.warn(e.message)
    process.exit(1)
  }
}

function gitTag() {
  let tag = 'x.x.x'
  try {
    tag = execSync('git describe --tags --abbrev=0 --always', {
      encoding: 'utf8',
    })
    if (!tag.match(/\d+\.\d+\.\d+/)) {
      throw new Error('Tag 不合法')
    }
  } catch {
    tag = '1.0.0'
  }
  return tag.trim()
}

/**
 *
 * @param {string} str
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 *
 * @param {string} cmd
 * @param {{}} [options]
 */
function sh(cmd, options = {}) {
  const defaultOptions = {
    stdio: 'inherit',
    shell: true,
  }

  const child = spawnSync(cmd, { ...defaultOptions, ...options })
  if (child.status !== 0) {
    process.exit(child.status || undefined)
  }
  return child.stdout
}

/**
 *
 * @param {string} message
 */
function slack(message) {
  const cmd = `curl -X POST \
    -H 'Content-type: application/json' \
    --data '{"text":"${message}"}' \
    ${SLACK_WEB_HOOK_URL}`
  sh(cmd)
}

module.exports = {
  copy,
  uploadFile,
  gitTag,
  capitalize,
  sh,
  slack,
}
