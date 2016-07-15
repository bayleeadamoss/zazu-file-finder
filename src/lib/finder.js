const path = require('path')
const fs = require('fs')

const File = require('./file')

class Finder {
  constructor(options) {
    this.options = options
    this.blackList = [
      'node_modules',
      'bower_components',
      'vendor',
      'tmp',
      'tags',
      'log',
    ]
  }

  find (searchPath, eachFn) {
    return new Promise((accept, reject) => {
      fs.readdir(searchPath, (err, fileNames) => {
        if (err) return reject(err)
        const promises = fileNames.filter((file) => {
          return this.blackList.indexOf(file) === -1
        }).map((fileName) => {
          return new File(path.join(searchPath, fileName))
        }).filter((fileModel) => {
          return fileModel.isViewable(this.options.exclude)
        }).map((fileModel) => {
          return fileModel.getStats().then((fileModel) => {
            if (fileModel.stats) eachFn(fileModel)
          })
        })
        Promise.all(promises).then(accept)
      })
    })
  }

  deepFind (searchPath, eachFn) {
    const queue = []
    return this.find(searchPath, (fileModel) => {
      if (fileModel.isDirectory()) {
        queue.push(this.deepFind(fileModel.filePath, eachFn))
      }
      eachFn(fileModel)
    }).then(() => {
      return Promise.all(queue)
    })
  }
}

module.exports = Finder
