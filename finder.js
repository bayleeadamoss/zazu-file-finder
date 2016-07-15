const path = require('path')
const os = require('os')
const Finder = require('./lib/finder')
const query = 'finder.js'

const finder = new Finder({
  includePath: [
    path.join(os.homedir()),
  ],
  excludePath: [
    path.join(os.homedir(), 'Library'),
  ],
  excludeName: [
    'node_modules',
    'bower_components',
    'vendor',
    'tmp',
    'tags',
    'log',
  ],
})

finder.deepFind().then((files) => {
  return files.filter((file) => {
    return file.name.match(query)
  })
}).then((matchedFiles) => {
  console.log(matchedFiles.map((file) => {
    return file.toJson()
  }))
})
