const directories = require('./directories')
const Finder = require('./lib/finder')
const fs = require('fs')
const path = require('path')

function setup (pluginContext) {
  const { cwd } = pluginContext
  const appPath = path.join('data', 'applications.json')
  const finder = new Finder({
    includePath: directories.appPath,
    excludePath: directories.excludePath,
    excludeName: directories.excludeName,
  })
  return function run () {
    return finder.deepFind().then((files) => {
      return files.filter((file) => {
        return file.isApp()
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

const cwd = __dirname

setup({ cwd })()
