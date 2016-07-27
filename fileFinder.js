const debounce = require('debounce')
const Promise = require('bluebird')
const directories = require('./directories')
const Finder = require('./lib/finder')

const finder = new Finder({
  includePath: directories.filePath,
  excludePath: directories.excludePath,
  excludeName: directories.excludeName,
})

Promise.config({
  cancellation: true,
})

module.exports = (pluginContext) => {
  let promise = Promise.resolve()
  return (query, env = {}) => {
    promise.cancel()
    return promise = new Promise((resolve, reject, onCancel) => {
      const timeout = setTimeout(resolve, 200)
      onCancel(() => {
        clearTimeout(timeout)
        reject()
      })
    }).then(() => {
      return finder.deepFind().then((files) => {
        const regex = new RegExp(query, 'i')
        return files.filter((file) => {
          return file.name.match(regex)
        })
      }).then((matchedFiles) => {
        return matchedFiles.slice(0, 9).map((file) => {
          return file.toJson()
        })
      })
    })
  }
}
