const fuzzyfind = require('fuzzyfind')
const Adapter = require('../../lib/adapter')
const mdfind = require('./mdfind')

class MDFind extends Adapter {
  findFiles (query) {
    const { filePath, excludeName, excludePath } = this.env.directories
    const options = {
      cwd: this.cwd,
      include: filePath,
      exclude: excludeName.concat(excludePath),
    }

    return mdfind(query, options).then((files) => {
      return fuzzyfind(query, files, {
        accessor: function (obj) {
          return obj.name + obj.path
        },
      }).slice(0, 20).map(file => file.toJson())
    })
  }

  findApps (query) {
    const { appPath, excludeName, excludePath } = this.env.directories
    const options = {
      cwd: this.cwd,
      include: appPath,
      exclude: excludeName.concat(excludePath),
    }
    return mdfind(`(kind:app OR kind:pref) ${query}`, options).then((files) => {
      return fuzzyfind(query, files, {
        accessor: function (obj) {
          return obj.name + obj.path
        },
      }).slice(0, 20).map(file => file.toJson())
    })
  }

  cacheIcons (apps) {
    return Promise.all(apps
      .filter((file) => !file.hasIcon())
      .slice(0, 20)
      .map(file => file.generateIcon()))
      .then(() => apps)
  }

  startCache () {
    const { appPath, excludeName, excludePath } = this.env.directories
    const options = {
      cwd: this.cwd,
      include: appPath,
      exclude: excludeName.concat(excludePath),
    }

    return mdfind('kind:app OR kind:pref', options)
      .then(apps => this.cacheIcons(apps))
      .then(apps => apps.map(app => app.toJson()))
  }

  static isInstalled () {
    return process.platform === 'darwin'
  }
}

module.exports = MDFind
