const path = require('path')
const os = require('os')
const Finder = require('./lib/finder')
const query = process.argv.slice(-1)[0]
const regex = new RegExp(query, 'i')

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
    return file.name.match(regex)
  })
}).then((matchedFiles) => {
  console.log(matchedFiles.slice(0, 9).map((file) => {
    return file.toJson()
  }))
})
