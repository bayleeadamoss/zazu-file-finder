const fork = require('child_process').fork
const path = require('path')

module.exports = (pluginContext) => {
  const { cwd } = pluginContext
  const appCacheProcess = path.join(cwd, 'fileFinder.js')
  let runner
  return (query) => {
    if (runner) runner.kill('SIGKILL')
    runner = fork(appCacheProcess, [query], {
      cwd,
      stdio: 'pipe',
    })
    return new Promise((resolve) => {
      const raw = []
      runner.on('message', (data) => {
        resolve(data)
      })
      runner.on('exit', () => {
        runner = null
      })
    })
  }
}
