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

function gitTag() {
  let tag
  try {
    tag = execSync(`git describe --tags --abbrev=0 --always`, {
      encoding: 'utf8',
    })
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
 * @param {{}} [env]
 * @param {string} [cwd]
 */
function sh(cmd, env = process.env, cwd) {
  const child = spawnSync(cmd, {
    stdio: 'inherit',
    shell: true,
    env,
    cwd,
  })
  if (child.status !== 0) {
    process.exit(child.status)
  }
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
  gitTag,
  capitalize,
  sh,
  slack,
}
