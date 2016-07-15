const directories = require('./directories')
const Finder = require('./lib/finder')
const query = process.argv.slice(-1)[0]
const regex = new RegExp(query, 'i')

const finder = new Finder({
  includePath: directories.appPath,
  excludePath: directories.excludePath,
  excludeName: directories.excludeName,
})

finder.deepFind().then((files) => {
  return files.filter((file) => {
    return file.isApp() && file.name.match(regex)
  })
}).then((matchedFiles) => {
  console.log(matchedFiles.slice(0, 9).map((file) => {
    return file.toJson()
  }))
})
