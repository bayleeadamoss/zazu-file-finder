const { fork } = require('child_process')
const path = require('path')
const Adapter = require('../../lib/adapter')

const fileFinderPath = path.join(__dirname, 'fileFinder.js')
const appCacheProcess = path.join(__dirname, 'appCache.js')

class Fallback extends Adapter {
  constructor (context, env = {}) {
    super(context, env)
    this.runner = null
  }

  findFiles (query) {
    if (this.runner) {
      this.runner.kill('SIGKILL')
    }

    const args = [this.cwd, query, JSON.stringify(this.env)]
    this.runner = fork(fileFinderPath, args, {
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

  startCache () {
    const args = [this.cwd, JSON.stringify(this.env)]
    const runner = fork(appCacheProcess, args)
    return new Promise((resolve) => {
      runner.on('message', (data) => resolve(data))
    })
  }
}

module.exports = Fallback
