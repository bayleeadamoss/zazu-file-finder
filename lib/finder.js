'use strict'

const path = require('path')
const fs = require('fs')

const File = require('./file')

class Finder {
  constructor(options) {
    this.options = options
  }

  findIn (searchPath) {
    return new Promise((accept, reject) => {
      const file = new File(searchPath, '')
      file.getStats().then(() => {
        if (file.isBroken()) return accept([])
        fs.readdir(searchPath, (err, fileNames) => {
          if (err) return reject(err)
          accept(fileNames)
        })
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
    let files = []
    const promises = this.options.includePath.map((includePath) => {
      return this.deepFindIn(includePath).then((newFiles) => {
        files = files.concat(newFiles)
      })
    })
    return Promise.all(promises).then(() => {
      return files
    })
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
