const fs = require('fs')
const os = require('os')
const path = require('path')
const HOME_REGEX = new RegExp('^' + os.homedir())
const plist = require('plist')

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
    try {
      const infoPath = path.join(this.path, 'contents', 'Info.plist')
      const file = plist.parse(fs.readFileSync(infoPath).toString())
      return file.CrAppModeShortcutName || file.CFBundleDisplayName || file.CFBundleName || fileName
    } catch (e) {
      return fileName
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
      icon: this.isDirectory() ? 'fa-folder' : 'fa-file',
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
