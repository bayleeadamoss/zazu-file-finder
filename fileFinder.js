const Promise = require('bluebird')
const directories = require('./directories')
const Finder = require('./lib/finder')
const filterSort = require('./lib/filterSort')

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
        return filterSort(query, files, (file) => file.name)
      }).then((matchedFiles) => {
        return matchedFiles.map((file) => {
          return file.toJson()
        })
      })
    })
  }
}
