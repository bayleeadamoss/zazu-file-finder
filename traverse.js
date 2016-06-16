const fs = require('fs')
const path = require('path')
const os = require('os')

const deepFind = (searchPath, options, eachFn) => {
  const queue = []
  return new Promise((accept) => {
    fs.readdir(searchPath, (err, fileNames) => {
      let length = 0
      let processed = 0
      fileNames.forEach((fileName) => {
        const filePath = path.join(searchPath, fileName)
        const isHidden = fileName.match(/^\./)
        const isExcluded = options.exclude.indexOf(filePath) !== -1
        if (!isHidden && !isExcluded) {
          length++
          fs.stat(filePath, (err, stats) => {
            if (!err) {
              eachFn(filePath, stats)
              const isDirectory = stats.isDirectory()
              const isSymbolicLink = stats.isSymbolicLink()
              const isMacApp = !!fileName.match(/\.app$/)
              if (isDirectory && !isSymbolicLink && !isMacApp) {
                queue.push(deepFind(filePath, options, eachFn))
              }
            }
            processed++
            if (processed === length) accept()
          })
        }
      })
      if (length === 0) accept()
    })
  }).then(() => {
    return Promise.all(queue)
  })
}

const db = require('./db')
const chunkSize = 125
let promise = Promise.resolve()
const process = (files) => {
  return promise = promise.then(() => {
    return db.batchInsert('files', files, chunkSize).then(() => {
      console.log('processed', files.length)
    }).catch((error) => {
      console.log('processing error', error.message, error.stack)
    });
  })
}

const ONE_HOUR_AGO = Date.now() - 60 * 60 * 1000
const HOME_PATH = os.homedir()
const exclude = [
  path.join(HOME_PATH, 'Library'),
]
let files = []
deepFind(HOME_PATH, { exclude }, (path, stats) => {
  files.push({
    path,
    type: stats.isDirectory() ? 'directory' : 'file',
    isRecent: stats.mtime > ONE_HOUR_AGO,
    isImportant: false, // if a seed directory
    lastModified: stats.mtime,
    lastProcessed: new Date(),
  })
  if (files.length === 100000) {
    process(files)
    files = []
  }
}).then(() => {
  return process(files)
}).then(() => {
  console.log('done')
  db.destroy()
})
