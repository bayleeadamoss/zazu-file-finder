const fs = require('fs')
const os = require('os')
const path = require('path')
const HOME_REGEX = new RegExp('^' + os.homedir())

class File {
  constructor (filePath, name) {
    this.path = filePath
    this.name = name || this.getName()
    this.stats = null
  }

  getName () {
    if (os.platform().match(/(darwin|win32)/) && this.isApp()) {
      //  strip file extension
      return path.parse(this.path).name
    } else {
      return path.basename(this.path)
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

  isViewable (exclude) {
    const isHidden = this.path.match(/\/\.[^/]+$/)
    const isExcluded = exclude.indexOf(this.path) !== -1
    return !isHidden && !isExcluded
  }

  isApp () {
    switch (os.platform()) {
      case 'darwin':
        return !!this.path.match(/\.(prefPane|app)$/)
      case 'win32':
        return !!this.path.match(/\.(lnk|appref-ms|exe)$/)
      default:
        //  Check whether its executable file.
        if (this.stats && this.stats.mode) {
          return !!(this.stats.mode & 0b001001001)
        }
    }
    return false
  }

  isDirectory () {
    const isDirectory = this.stats.isDirectory()
    const isSymbolicLink = this.stats.isSymbolicLink()
    const isMacApp = os.platform() === 'darwin' && this.isApp()
    return isDirectory && !isSymbolicLink && !isMacApp
  }

  isBroken () {
    return !this.stats
  }

  relativePath () {
    return this.path.replace(HOME_REGEX, '~')
  }

  icon () {
    return this.isDirectory() ? 'fa-folder' : 'fa-file'
  }

  toJson () {
    return {
      icon: this.icon(),
      title: this.name,
      subtitle: this.relativePath(),
      value: this.relativePath(),
    }
  }
}

module.exports = File
