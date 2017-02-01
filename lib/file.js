const fs = require('fs')
const os = require('os')
const path = require('path')
const HOME_REGEX = new RegExp('^' + os.homedir())
const plist = require('simple-plist')
const sha1 = require('sha1')
const iconutil = require('iconutil')
const mkdirp = require('mkdirp')
const async = require('async')
const exec = require('child_process').exec

const iconutilQueue = async.queue(iconutil.toIconset, 20)

const SYSTEM_DEFAULT_APP_ICNS =
  '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns'

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
        const infoPath = path.join(this.path, 'Contents', 'Info.plist')
        this.info = plist.readFileSync(infoPath)
        //  generate icon if it's not existed
        this.iconPath = path.join('data', 'icons', `${this.name}-${sha1(this.path)}.png`)
        const iconAbsPath = path.join(this.options.cwd || '', this.iconPath)
        if (!fs.existsSync(iconAbsPath)) {
          this.generateIcon(iconAbsPath)
        }
      }
    } catch (err) {
      console.trace(`Error when loading plist of ${this.name}: ${err}`)
    }
  }

  findBestIcon (keys) {
    //  Priorities: 128 > 256 > the largest
    const regexNameParser = /x(\d+)(?:@(\w+))?/
    const items = keys.map(key => {
      const match = key.match(regexNameParser)
      return match ? { size: Number(match[1]), scale: match[2], key } : { size: 0, key }
    }).sort((a, b) => a.size - b.size)
    const findBySize = (size) => items.find(item => item.size === size && item.scale !== '2x')
    const preferedItem = findBySize(128) || findBySize(256) || items[items.length - 1]
    return preferedItem.key
  }

  generateIcon (iconPath) {
    try {
      //  Create directory if it's not exist.
      const basedir = path.dirname(iconPath)
      if (!fs.existsSync(basedir)) {
        mkdirp.sync(basedir)
      }

      if (this.info.CFBundleIconFile) {
        //  Generate the icon from '.icns' file
        let icnsPath = path.join(this.path, 'Contents', 'Resources', this.info.CFBundleIconFile)
        if (this.info.CFBundleIconFile.indexOf('.') < 0) {
          icnsPath = `${icnsPath}.icns`
        }

        if (fs.existsSync(icnsPath)) {
          iconutilQueue.push(icnsPath, (err, icons) => {
            if (err) {
              console.error(`iconutil.toIconset(${icnsPath}): ${err}`)
            } else {
              fs.writeFileSync(iconPath, icons[this.findBestIcon(Object.keys(icons))])
            }
          })
        } else {
          //  Check for TIFF file
          const tiffPath = `${icnsPath.substr(0, icnsPath.lastIndexOf('.'))}.tiff`
          if (fs.existsSync(tiffPath)) {
            //  Found TIFF file and convert it to PNG
            exec(`sips -s format png '${tiffPath}' --out '${iconPath}'`,
              (error, stdout, stderr) => { if (error) { console.error(stderr) } })
          } else {
            //  For the apps without icons, use system default app icon as last resort
            if (fs.existsSync(SYSTEM_DEFAULT_APP_ICNS)) {
              iconutilQueue.push(SYSTEM_DEFAULT_APP_ICNS, (err, icons) => {
                if (err) {
                  console.error(`iconutil.toIconset(${SYSTEM_DEFAULT_APP_ICNS}): ${err}`)
                } else {
                  fs.writeFileSync(iconPath, icons[this.findBestIcon(Object.keys(icons))])
                }
              })
            } else {
              console.error(`Cannot find '${icnsPath}' and no system default app icon available.`)
            }
          }
        }
      }
    } catch (e) {
      console.error(`Exception when generateIcon(${this.path}): ${e}`)
    }
  }

  title () {
    const fileName = this.name.split('.')[0]
    if (process.platform !== 'darwin' || !this.isApp()) {
      return fileName
    }
    return this.info.CrAppModeShortcutName || this.info.CFBundleDisplayName || this.info.CFBundleName || fileName
  }

  icon () {
    if (process.platform === 'darwin' && this.isApp()) {
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
