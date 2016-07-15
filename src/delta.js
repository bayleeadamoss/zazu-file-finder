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

const processUnknownFiles = (files) => {
  const missingFiles = []
  const filePromises = files.map((file) => {
    return db('files').where({
      path: file.path,
    }).update(file).then((count) => {
      if (count === 0) missingFiles.push(file)
    })
  })
  return Promise.all(filePromises).then(() => {
    return processFiles(missingFiles)
  })
}

const pruneDirectory = (path) => {
  db('files').select('lastProcessed')
  .whereRaw('path LIKE "' + path + '%"')
  .then((files) => {
    const rootFiles = files.filter((file) => {
      return file.path.match(new RegExp('^' + path + '[^/]+$'))
    })
    console.log(files)
  })
}

const finder = new Finder({
  exclude: [ path.join(os.homedir(), 'Library') ],
})
const processDirs = (dirs) => {
  return new Promise((accept, reject) => {
    const promises = dirs.map((dir) => {
      const files = []
      return finder.find(dir.path, (fileModel) => {
        files.push(Object.assign({}, fileModel.toJson(), {
          isImportant: false, // is seed directory
          lastProcessed: new Date(),
        }))
      }).then(() => {
        return processUnknownFiles(files)
      }).then(() => {
        return pruneDirectory(dir.path)
      })
    })
    return Promise.all(promises).then(accept)
  })
}

db('files').where({
  isRecent: true,
  type: 'directory',
})
.select('*')
.then(processDirs)
.then(() => {
  return db('files').count('* as lagCount').where({
    isRecent: false,
    type: 'directory',
  }).then((rows) => {
    const tenth = Math.ceil(rows[0].lagCount / 10)
    const limit = Math.max(tenth, 5000)
    return db('files').where({
      isRecent: false,
      type: 'directory',
    })
    .select('*')
    .orderBy('lastProcessed', 'ASC')
    .orderBy('lastModified', 'ASC')
    .limit(limit)
    .then(processDirs)
  })
})
.then(() => {
  console.log('yeahhh')
  db.destroy()
})
