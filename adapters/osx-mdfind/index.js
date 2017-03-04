const fs = require('fs')
const path = require('path')
const app2png = require('app2png')
const fuzzyfind = require('fuzzyfind')
const freshRequire = require('../../lib/freshRequire')
const { spawn } = require('child_process')
let currentWorkingDirectory = null

class File {
  constructor (filePath, fileName) {
    this.path = filePath
    this.name = fileName
    this.iconPath = path.join(
      currentWorkingDirectory,
      `./data/icons/${path.basename(this.path)}.png`
    )
  }

  isApp () {
    return this.path.match(/\.app$/)
  }

  icon () {
    return this.hasIcon() ? this.iconPath : 'fa-file'
  }

  generateIcon () {
    if (this.hasIcon()) return Promise.resolve()
    return app2png.convert(this.path, this.iconPath)
  }

  hasIcon () {
    return fs.existsSync(this.iconPath)
  }

  toJson () {
    return {
      id: this.path,
      icon: this.icon(),
      title: this.name,
      subtitle: this.path,
      value: this.path,
    }
  }
}

const mdfind = (term, options) => {
  return new Promise((resolve, reject) => {
    const params = options.include.reduce((memo, dir) => {
      memo.unshift('-onlyin', dir)
      return memo
    }, ['-attr', 'kMDItemDisplayName', term])

    const res = spawn('mdfind', params)
    const data = []
    const err = []

    res.stdout.on('data', (piece) => {
      data.push(piece.toString())
    })

    res.stderr.on('data', (err) => {
      err.push(err.toString())
    })

    res.on('close', (code) => {
      if (code === 0) {
        const files = data.join('').split('\n')
          .filter(Boolean)
          .filter((file) => {
            const badPieces = file.split('/').filter((piece) => {
              return options.exclude.includes(piece)
            })
            return badPieces.length === 0
          })
          .map((file) => {
            const res = file.match(/(.*) {3}kMDItemDisplayName = (.*)/)
            return new File(res[1], res[2])
          })
        return resolve(files)
      }
      reject(err.join('').trim())
    })
  })
}

class MDFind {
  constructor (cwd, env) {
    this.cwd = cwd
    this.env = env
    this.env.directories = this.env.directories || {}
    this.appCachePath = path.join(cwd, 'data', 'applications.json')
    this.hasCache = fs.existsSync(this.appCachePath)
    currentWorkingDirectory = cwd
  }

  options () {
    if (!this.directories) {
      const append = this.env.append
      const { appPath, filePath, excludePath, excludeName } = this.env.directories
      const directories = require('../../directories')
      if (append) {
        directories.appPath = directories.appPath.concat(appPath || [])
        directories.filePath = directories.filePath.concat(filePath || [])
        directories.excludePath = directories.excludePath.concat(excludePath || []) // !! not used yet
        directories.excludeName = directories.excludeName.concat(excludeName || [])
      } else {
        directories.appPath = appPath || directories.appPath
        directories.filePath = filePath || directories.filePath
        directories.excludePath = excludePath || directories.excludePath // !! not used yet
        directories.excludeName = excludeName || directories.excludeName
      }
      this.directories = directories
    }
    return this.directories
  }

  findFiles (query) {
    const { filePath, excludeName, excludePath } = this.options()
    const options = {
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
    if (this.hasCache) {
      const cachedApps = freshRequire(this.appCachePath)
      return Promise.resolve(
        fuzzyfind(query, cachedApps, {
          accessor: (obj) => {
            return obj.title + obj.subtitle
          },
        }).slice(0, 20)
      )
    }

    const { appPath, excludeName, excludePath } = this.options()
    const options = {
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

  cacheApps (apps) {
    const appCachePath = path.join(this.cwd, 'data', 'applications.json')
    return new Promise((resolve, reject) => {
      const fileJson = JSON.stringify(apps.map((file) => {
        return file.toJson()
      }))
      fs.writeFile(appCachePath, fileJson, (err) => {
        err ? reject(err) : resolve()
      })
    }).then(() => {
      this.hasCache = true
    })
  }

  cacheIcons (apps) {
    return Promise.all(apps
      .filter((file) => !file.hasIcon())
      .slice(0, 20)
      .map(file => file.generateIcon()))
  }

  startCache () {
    const { appPath, excludeName, excludePath } = this.options()
    const options = {
      include: appPath,
      exclude: excludeName.concat(excludePath),
    }

    return mdfind('kind:app OR kind:pref', options).then((apps) => {
      return Promise.all([
        this.cacheIcons(apps),
        this.cacheApps(apps),
      ])
    })
  }

  static isInstalled () {
    return process.platform === 'darwin'
  }
}

module.exports = MDFind
