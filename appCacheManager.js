const fork = require('child_process').fork
const path = require('path')

module.exports = (pluginContext) => {
  const { cwd } = pluginContext
  const appCacheProcess = path.join(cwd, 'appCache.js')
  return (options) => {
    const {directories} = options;
    const runner = fork(appCacheProcess, [cwd, JSON.stringify(options)])
    return new Promise((resolve) => {
      runner.on('exit', resolve)
    })
  }
}
