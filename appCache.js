const directories = require('./directories')
const Finder = require('./lib/finder')
const fs = require('fs')
const path = require('path')

const finder = new Finder({
  includePath: directories.appPath,
  excludePath: directories.excludePath,
  excludeName: directories.excludeName,
})

module.exports = (pluginContext) => {
  const { cwd } = pluginContext
  const appPath = path.join(cwd, 'data', 'applications.json')
  return (env = {}) => {
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
