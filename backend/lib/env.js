const fs = require('fs')
const path = require('path')

const parseEnvLine = (line) => {
  const trimmed = line.trim()

  if (!trimmed || trimmed.startsWith('#')) {
    return null
  }

  const index = trimmed.indexOf('=')
  if (index === -1) {
    return null
  }

  const key = trimmed.slice(0, index).trim()
  let value = trimmed.slice(index + 1).trim()

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }

  return { key, value }
}

exports.loadEnv = () => {
  const envPath = path.resolve(__dirname, '../.env')

  if (!fs.existsSync(envPath)) {
    return
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split(/\r?\n/).forEach((line) => {
    const parsed = parseEnvLine(line)

    if (parsed && !process.env[parsed.key]) {
      process.env[parsed.key] = parsed.value
    }
  })
}
