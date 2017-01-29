const fs = require('fs')
const os = require('os')
const path = require('path')
const plist = require('plist')
const HOME_REGEX = new RegExp('^' + os.homedir())
const nativeImage = require('electron').nativeImage

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

  toJson () {
    return {
      icon: this.isDirectory() ? 'fa-folder' : getIcon(this.relativePath()),
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

function getIcon (path) {
  let iconImg = 'fa-file'

    // TODO Refactoring & Test
  if (path[0] === '~') {
    path = path.replace('~', process.env.HOME)
  }
  if (path.split('.').indexOf('app') >= 0 && fs.existsSync(path)) {
    let plistInfo = fs.readFileSync(path + '/Contents/Info.plist').toString()
    plistInfo = plist.parse(plistInfo)

    const iconFile = path + '/Contents/Resources/' + plistInfo.CFBundleIconFile
    const pathTmp = app.getAppPath() + '/tmp/' + new Buffer(iconFile).toString('base64') + '.png'
    const exec = require('child_process').execSync
    exec('sips -Z 25 -s format png "' + path + '/Contents/Resources/' + iconFile + '" --out "' + pathTmp + '"')
    let image = nativeImage.createFromPath(pathTmp)
    iconImg = 'data: image/png;base64,' + image.toPNG().toString('base64')
  }
  return iconImg
}
