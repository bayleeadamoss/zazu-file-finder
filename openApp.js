const spawn = require('child_process').spawn
const os = require('os')
const path = require('path')

module.exports = (pluginContext) => {
  const { cwd } = pluginContext
  return (app, env = {}) => {
    return new Promise((resolve, reject) => {
      if (process.platform === 'win32' || process.platform === 'darwin') {
        return resolve(value)
      }

      // Use absolute paths at all time
      if (app.substring(0, 1) == '~') {
        app = os.homedir() + app.substring(1);
      }

      var p =  spawn(app, [], {
        cwd: os.homedir()
      })
      p.stderr.on('data', (data) => {
        console.error('err (' + path.basename(app) + '): ' + data);
      })

      reject() // break chain
    })
  }
}
