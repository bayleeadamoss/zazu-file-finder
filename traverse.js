const fs = require('fs')
const path = require('path')
const os = require('os')

const ONE_HOUR_AGO = Date.now() - 60 * 60 * 1000

class File {
  constructor (filePath) {
    this.filePath = filePath
    this.stats = null
  }

  isViewable (exclude = []) {
    const isHidden = this.filePath.match(/\/\.[^\/]+$/)
    const isExcluded = exclude.indexOf(this.filePath) !== -1
    return !isHidden && !isExcluded
  }

  isDirectory () {
    const isDirectory = this.stats.isDirectory()
    const isSymbolicLink = this.stats.isSymbolicLink()
    const isMacApp = !!this.filePath.match(/\.app$/)
    return isDirectory && !isSymbolicLink && !isMacApp
  }

  toJson () {
    return {
      path: this.filePath,
      type: this.isDirectory() ? 'directory' : 'file',
      isRecent: this.stats.mtime > ONE_HOUR_AGO,
      lastModified: this.stats.mtime,
    }
  }

  getStats () {
    return new Promise((accept, reject) => {
      fs.stat(this.filePath, (err, stats) => {
        if (!err) this.stats = stats
        accept(this)
      })
    })
  }
}

class Finder {
  constructor(options) {
    this.options = options
  }

  find (searchPath, eachFn) {
    return new Promise((accept, reject) => {
      fs.readdir(searchPath, (err, fileNames) => {
        if (err) return reject(err)
        const promises = fileNames.map((fileName) => {
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

const db = require('./db')
const CHUNK_SIZE = 125
let promise = Promise.resolve()
const processFiles = (files) => {
  return promise = promise.then(() => {
    console.log('found', files.length)
    return db.batchInsert('files', files, CHUNK_SIZE).then(() => {
      console.log('processed', files.length)
    }).catch((error) => {
      console.log('processing error', error.message, error.stack)
    })
  })
}

const HOME_PATH = path.join(os.homedir())
const exclude = [
  path.join(os.homedir(), 'Library'),
]
let files = []
const finder = new Finder({ exclude })
finder.deepFind(HOME_PATH, (fileModel) => {
  files.push(Object.assign({}, fileModel.toJson(), {
    isImportant: false, // is seed directory
    lastProcessed: new Date(),
  }))
  if (files.length === 50000) {
    processFiles(files)
    files = []
  }
}).then(() => {
  return processFiles(files)
}).then(() => {
  console.log('done')
  db.destroy()
})
