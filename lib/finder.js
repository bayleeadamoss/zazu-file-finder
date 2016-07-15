const path = require('path')
const fs = require('fs')

const File = require('./file')

class Finder {
  constructor(options) {
    this.options = options
  }

  findIn (searchPath) {
    return new Promise((accept, reject) => {
      fs.readdir(searchPath, (err, fileNames) => {
        if (err) return reject(err)
        accept(fileNames)
      })
    }).then((fileNames) => {
      return fileNames.filter((file) => {
        return this.options.excludeName.indexOf(file) === -1
      }).map((fileName) => {
        return new File(fileName, searchPath)
      }).filter((fileModel) => {
        return fileModel.isViewable(this.options.excludePath)
      })
    }).then((filteredFiles) => {
      const promises = filteredFiles.map((fileModel) => {
        return fileModel.getStats()
      })
      return Promise.all(promises).then(() => {
        return filteredFiles.filter((file) => {
          return !file.isBroken()
        })
      })
    })
  }

  deepFind () {
    return this.deepFindIn(this.options.includePath[0])
  }

  deepFindIn (searchPath) {
    return this.findIn(searchPath).then((files) => {
      const queue = []
      files.forEach((file) => {
        if (file.isDirectory()) {
          queue.push(this.deepFindIn(file.path).then((newFiles) => {
            files = files.concat(newFiles)
          }))
        }
      })
      return Promise.all(queue).then(() => {
        return files
      })
    })
  }
}

module.exports = Finder
