const path = require('path')
const os = require('os')
const Finder = require('./lib/finder')
const query = process.argv.slice(-1)[0]
const regex = new RegExp(query, 'i')

const finder = new Finder({
  includePath: [
    // osx
    path.join('/', 'System', 'Library', 'PreferencePanes'),
    path.join(os.homedir(), 'Applications'),
    path.join('/', 'Applications'),
    // win
    path.join('C:', 'Program Files'),
    path.join('C:', 'Program Files (x86)'),
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

finder.deepFind().then((files = []) => {
  return files.filter((file) => {
    return file.isApp() && file.name.match(regex)
  })
}).then((matchedFiles) => {
  console.log(matchedFiles.slice(0, 9).map((file) => {
    return file.toJson()
  }))
}).catch((err) => {
  console.log('Error', err.message, err.stack)
})
