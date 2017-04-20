const defaultDirectories = require('../directories')

const getPath = (defaultPaths, userPaths, append) => append ? defaultPaths.concat(userPaths || []) : (userPaths || defaultPaths)

class Adapter {
  constructor (context = {}, env = {}) {
    this.context = context
    this.cwd = context.cwd || '.'
    this.console = context.console || console
    this.env = env
    this.processDirectories()
  }

  processDirectories () {
    const { append, directories } = this.env
    const { appPath, filePath, excludePath, excludeName } = directories || {}
    this.env.directories = {
      appPath: getPath(defaultDirectories.appPath, appPath, append),
      filePath: getPath(defaultDirectories.filePath, filePath, append),
      excludePath: getPath(defaultDirectories.excludePath, excludePath, append),
      excludeName: getPath(defaultDirectories.excludeName, excludeName, append),
    }
  }

  findFiles (query) {
    return Promise.resolve([])
  }

  findApps (query) {
    return Promise.resolve([])
  }

  startCache () {
    return Promise.resolve([])
  }
}

module.exports = Adapter
