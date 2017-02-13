const async = require('async')
const crypto = require('crypto')
const exec = require('child_process').exec
const fs = require('fs')
const iconutil = require('iconutil')
const mkdirp = require('mkdirp')
const path = require('path')
const plist = require('simple-plist')

const SYSTEM_DEFAULT_APP_ICNS =
  '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns'

const loadAppInfoMac = (appPath) => plist.readFileSync(path.join(appPath, 'Contents', 'Info.plist'))

const loadAppInfo = (appPath) => process.platform === 'darwin' ? loadAppInfoMac(appPath) : {}

const sha1 = (message) => crypto.createHash('sha1').update(message).digest().toString('hex')

const getAppIconCachePath = (appPath, appName, cwd = '') => path.join(cwd, 'data', 'icons', `${appName}-${sha1(appPath)}.png`)

const getAppIcnsPath = (appPath, info) => {
  if (!info.CFBundleIconFile) {
    return ''
  }

  let icnsPath = path.join(appPath, 'Contents', 'Resources', info.CFBundleIconFile)
  //  attach the default extension, `.icns`, if there isn't one.
  return path.extname(info.CFBundleIconFile) === '' ? `${icnsPath}.icns` : icnsPath
}

const findBestIcon = (keys) => {
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

const iconutilQueue = async.queue(iconutil.toIconset, 20)

const convertIcnsToPNG = (icnsPath, pngPath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(icnsPath)) {
      iconutilQueue.push(icnsPath, (err, icons) => {
        if (err) {
          reject(`iconutil.toIconset(${icnsPath}): ${err}`)
        } else {
          fs.writeFileSync(pngPath, icons[findBestIcon(Object.keys(icons))])
          resolve(pngPath)
        }
      })
    } else {
      reject(`ICNS file '${icnsPath}' doesn't exist.`)
    }
  })
}

const convertTiffToPNG = (tiffPath, pngPath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(tiffPath)) {
      //  Found TIFF file and convert it to PNG
      exec(`sips -s format png '${tiffPath}' --out '${pngPath}'`,
        (error, stdout, stderr) => error ? reject(stderr) : resolve(stdout))
    } else {
      reject(`TIFF file '${tiffPath}' doesn't exist.`)
    }
  })
}

const generateIcon = (icnsPath, pngPath) => {
  return new Promise((resolve, reject) => {
    //  Create directory if it's not exist.
    const basedir = path.dirname(pngPath)
    if (!fs.existsSync(basedir)) {
      mkdirp.sync(basedir)
    }

    //  Try to convert ICNS first
    convertIcnsToPNG(icnsPath, pngPath)
      .then(() => resolve(pngPath))
      //  Then try for TIFF file
      .catch(() => convertTiffToPNG(`${icnsPath.substr(0, icnsPath.lastIndexOf('.'))}.tiff`, pngPath)
        .then(() => resolve(pngPath))
        //  Try to use system default icon
        .catch(() => convertIcnsToPNG(SYSTEM_DEFAULT_APP_ICNS, pngPath)
          .then(() => resolve(pngPath))
          //  Nothing works, reject error
          .catch(() => reject(`Cannot find '${icnsPath}' and no system default app icon available.`))
        )
      )
  })
}

module.exports = {
  loadAppInfo,
  generateIcon,
  getAppIconCachePath,
  getAppIcnsPath,
}
