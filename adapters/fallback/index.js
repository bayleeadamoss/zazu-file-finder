const { fork } = require('child_process')
const fs = require('fs')
const path = require('path')

class Fallback {
  constructor (context, env = {}) {
    this.env = env
    this.cwd = context.cwd
    this.runner = null
    this.fileFinderPath = path.join(__dirname, 'fileFinder.js')
    this.appCacheProcess = path.join(__dirname, 'appCache.js')
  }

  findFiles (query) {
    if (this.runner) {
      this.runner.kill('SIGKILL')
    }

    const args = [this.cwd, query, JSON.stringify(this.env)]
    this.runner = fork(this.fileFinderPath, args, {
      cwd: this.cwd,
      stdio: 'pipe',
    })
    return new Promise((resolve) => {
      this.runner.on('message', (data) => {
        resolve(data)
      })
      this.runner.on('exit', () => {
        this.runner = null
      })
    })
  }

  findApps (query) {
    return Promise.resolve([])
  }

  startCache () {
    const args = [this.cwd, JSON.stringify(this.env)]
    const runner = fork(this.appCacheProcess, args)
    return new Promise((resolve) => {
      runner.on('message', (data) => resolve(data))
      runner.on('exit', () => {
        this.hasCache = fs.existsSync(this.appCachePath)
        resolve()
      })
    })
  }
}

module.exports = Fallback
