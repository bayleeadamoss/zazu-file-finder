const path = require('path')
const os = require('os')

const db = require('./db')
const Finder = require('./lib/finder')
const CHUNK_SIZE = 125

let promise = Promise.resolve()
const processFiles = (files) => {
  if (files.length === 0) return promise
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
const finder = new Finder({
  exclude: [ path.join(os.homedir(), 'Library') ],
})
let files = []
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
