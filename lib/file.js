const fs = require('fs')
const os = require('os')
const path = require('path')
const plist = require('plist')
const iconutil = require('iconutil')
const HOME_REGEX = new RegExp('^' + os.homedir())

class File {
  constructor (name, dir) {
    this.name = name
    this.path = path.join(dir, name)
    this.stats = null
  }

  isViewable (exclude) {
    const isHidden = this.path.match(/\/\.[^/]+$/)
    const isExcluded = exclude.indexOf(this.path) !== -1
    return !isHidden && !isExcluded
  }

  isApp () {
    return this.isAppMac() || this.isAppWindows() || this.isAppLinux()
  }

  isAppMac () {
    if (process.platform !== 'darwin') {
      return false
    }

    return !!this.name.match(/\.(prefPane|app)$/)
  }

  isAppWindows () {
    if (process.platform !== 'win32') {
      return false
    }

    return !!this.name.match(/\.(exe)$/)
  }

  isAppLinux () {
    if (process.platform === 'win32' || process.platform === 'darwin') {
      return false
    }
    const mode = this.stats.mode
    return !!(((mode >> 6) & 1) || (((mode << 3) >> 6) & 1) || (((mode << 6) >> 6) & 1))
  }

  title () {
    const fileName = this.name.split('.')[0]
    if (process.platform !== 'darwin' || !this.isApp()) {
      return fileName
    }
    const info = this.info()
    return info.CrAppModeShortcutName || info.CFBundleDisplayName || info.CFBundleName || fileName
  }

  isDirectory () {
    const isDirectory = this.stats.isDirectory()
    const isSymbolicLink = this.stats.isSymbolicLink()
    return isDirectory && !isSymbolicLink && !this.isAppMac()
  }

  isBroken () {
    return !this.stats
  }

  relativePath () {
    return this.path.replace(HOME_REGEX, '~')
  }

  info () {
    try {
      const infoPath = path.join(this.path, 'contents', 'Info.plist')
      return plist.parse(fs.readFileSync(infoPath).toString())
    } catch (e) {
      return {}
    }
  }

  icon () {
    return new Promise((resolve, reject) => {
      if (this.isAppMac()) {
        const info = this.info()
        const icns = info.CFBundleIconFile.substr(-5) === '.icns' ? info.CFBundleIconFile : `${info.CFBundleIconFile}.icns`
        const iconPath = path.join(this.path, 'contents', 'Resources', icns)
        const getSize = (name) => name.match(/\d+/)[0]
        iconutil.toIconset(iconPath, (err, icons) => {
          if (err) return reject(err)
          const biggestIcon = Object.keys(icons).reduce((biggest, latest) => {
            const biggestSize = getSize(biggest)
            const latestSize = getSize(latest)
            return biggestSize > latestSize ? biggest : latest
          }, 'icon_0x0.png')
          fs.writeFile('Zazu.app.png', icons[biggestIcon], 'binary', (err) => {
            if (err) throw err
            console.log('File saved.')
          })
        })
      }
      resolve(this.isDirectory() ? 'fa-folder' : 'fa-file')
    })
  }

  toJson () {
    return new Promise((resolve) => {
      return this.icon()
    }).then((icon) => {
      return {
        icon,
        title: this.title(),
        subtitle: this.relativePath(),
        value: this.relativePath(),
        id: this.relativePath(),
      }
    })
  }

  getStats () {
    return new Promise((resolve, reject) => {
      fs.stat(this.path, (err, stats) => {
        if (!err) this.stats = stats
        resolve()
      })
    })
  }
}

module.exports = File
