const { fork } = require('child_process')
const fs = require('fs')
const path = require('path')
const freshRequire = require('./lib/freshRequire')
const filterSort = require('./lib/filterSort')

class Fallback {
  constructor (cwd, env) {
    this.env = env
    this.cwd = cwd
    this.runner = null
    this.fileFinderPath = path.join(cwd, 'adapters', 'fallback', 'fileFinder.js')
    this.appCacheProcess = path.join(cwd, 'adapters', 'fallback', 'appCache.js')
    this.appCachePath = path.join(cwd, 'adapters', 'fallback', 'data', 'applications.json')
    this.hasCache = fs.existsSync(this.appCachePath)
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
    if (!this.hasCache) {
      return Promise.resolve([])
    }
    const applications = freshRequire(this.appCachePath)
    return Promise.resolve(
      filterSort(query, applications, (item) => item.title + item.subtitle)
    )
  }

  startCache () {
    const args = [this.cwd, JSON.stringify(this.env)]
    const runner = fork(this.appCacheProcess, args)
    return new Promise((resolve) => {
      runner.on('exit', () => {
        this.hasCache = fs.existsSync(this.appCachePath)
        resolve()
      })
    })
  }
}

module.exports = Fallback
