const fs = require('fs')
const path = require('path')
const map = require('./mapAsync')
const os = require('os')
const HOME_PATH = os.homedir()
const exclude = [
  path.join(HOME_PATH, 'Library'),
]

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
            if (err) {
              return ++processed
            }
            eachFn(filePath, stats)
            const isDirectory = stats.isDirectory()
            const isSymbolicLink = stats.isSymbolicLink()
            const isMacApp = !!fileName.match(/\.app$/)
            if (isDirectory && !isSymbolicLink && !isMacApp) {
              queue.push(deepFind(filePath, options, eachFn))
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

const process = (name, files) => {
  console.log('processing', name, files.length)
}

let files = []
const start = new Date()
deepFind(HOME_PATH, { exclude }, (file, stats) => {
  files.push([file, stats])
  if (files.length === 100000) {
    process('chunk', files)
    files = []
  }
}).then(() => {
  process('remaining', files)
  console.log('time', new Date() - start)
})
