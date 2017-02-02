const fs = require('fs')
const os = require('os')
const path = require('path')
const HOME_REGEX = new RegExp('^' + os.homedir())

const appInfo = require('./appInfo')

class File {
  constructor (name, dir, options = {}) {
    this.name = name
    this.path = path.join(dir, name)
    this.options = options
    this.stats = null
    this.info = {}
    this.iconPath = ''
    this.loadInfo()
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

    return !!this.name.match(/\.(lnk)$/)
  }

  isAppLinux () {
    if (process.platform === 'win32' || process.platform === 'darwin') {
      return false
    }
    const mode = this.stats.mode
    return !!(((mode >> 6) & 1) || (((mode << 3) >> 6) & 1) || (((mode << 6) >> 6) & 1))
  }

  loadInfo () {
    try {
      if (this.isAppMac() && Object.keys(this.info).length === 0) {
        //  macOS App
        this.info = appInfo.loadAppInfo(this.path)
        this.iconPath = appInfo.getAppIconCachePath(this.path, this.name)
        const iconAbsPath = path.join(this.options.cwd || '.', this.iconPath)
        if (!fs.existsSync(iconAbsPath)) {
          const icnsPath = appInfo.getAppIcnsPath(this.path, this.info)
          appInfo.generateIcon(icnsPath, iconAbsPath)
            .catch(err => console.trace(err))
        }
      }
    } catch (err) {
      console.trace(`Error when loading app info of ${this.name}: ${err}`)
    }
  }

  title () {
    const fileName = this.name.split('.')[0]
    if (this.isAppMac()) {
      return this.info.CrAppModeShortcutName || this.info.CFBundleDisplayName || this.info.CFBundleName || fileName
    } else {
      return fileName
    }
  }

  icon () {
    if (this.isAppMac()) {
      return this.iconPath
    } else {
      return this.isDirectory() ? 'fa-folder' : 'fa-file'
    }
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

  toJson () {
    return {
      icon: this.icon(),
      title: this.title(),
      subtitle: this.relativePath(),
      value: this.relativePath(),
      id: this.relativePath(),
    }
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
