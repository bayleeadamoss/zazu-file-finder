const directories = require('../../directories')
const Finder = require('./lib/finder')
const fs = require('fs')
const path = require('path')
const resolvePaths = require('../../lib/resolvepaths')

function setup (pluginContext) {
  const { cwd } = pluginContext
  const { extra } = pluginContext
  const { append } = pluginContext
  const appPath = path.join(cwd, 'data', 'applications.json')

  if (append) {
    directories.appPath = directories.appPath.concat(extra.appPath || [])
    directories.excludePath = directories.excludePath.concat(extra.excludePath || [])
    directories.excludeName = directories.excludeName.concat(extra.excludeName || [])
  } else if (extra) {
    extra.appPath && (directories.appPath = extra.appPath)
    extra.excludePath && (directories.excludePath = extra.excludePath)
    extra.excludeName && (directories.excludeName = extra.excludeName)
  }

  const finder = new Finder({
    includePath: resolvePaths(directories.appPath),
    excludePath: resolvePaths(directories.excludePath),
    excludeName: resolvePaths(directories.excludeName),
    cwd,
  })

  return function run () {
    return finder.deepFind().then((files) => {
      return files.filter((file) => {
        return !file.isDirectory() && file.isApp()
      })
    }).then((matchedFiles) => {
      const fileJson = JSON.stringify(matchedFiles.map((file) => {
        return file.toJson()
      }))
      return new Promise((resolve, reject) => {
        fs.writeFile(appPath, fileJson, (err) => {
          err ? reject(err) : resolve()
        })
      })
    })
  }
}

(() => {
  const cwd = __dirname
  const options = process.argv.slice(-1)[0] ? JSON.parse(process.argv.slice(-1)[0]) : {}
  const { append } = options
  const { directories } = options

  setup({
    cwd: cwd,
    append: !!append,
    extra: directories,
  })()
})()
