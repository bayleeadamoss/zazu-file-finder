const fork = require('child_process').fork
const path = require('path')

module.exports = (pluginContext) => {
  const { cwd } = pluginContext
  const appCacheProcess = path.join(cwd, 'fileFinder.js')
  let runner
  return (query, options = {}) => {
    if (runner) {
      runner.kill('SIGKILL')
    }

    runner = fork(appCacheProcess, [cwd, query, JSON.stringify(options)], {
      cwd,
      stdio: 'pipe',
    })
    return new Promise((resolve) => {
      runner.on('message', (data) => {
        resolve(data)
      })
      runner.on('exit', () => {
        runner = null
      })
    })
  }
}
