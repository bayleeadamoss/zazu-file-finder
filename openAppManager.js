const { fork } = require('child_process')
const path = require('path')

module.exports = (pluginContext) => {
  const { cwd } = pluginContext
  return (value, env = {}) => {
    return new Promise((resolve, reject) => {
      if (process.platform === 'win32' || process.platform === 'darwin') {
        return resolve(value)
      }
      fork(path.join(cwd, 'openApp.js'), [value])
      reject() // break chain
    })
  }
}
