const directories = require('./directories')
const Finder = require('./lib/finder')
const fs = require('fs')

const finder = new Finder({
  includePath: directories.appPath,
  excludePath: directories.excludePath,
  excludeName: directories.excludeName,
})

finder.deepFind().then((files) => {
  return files.filter((file) => {
    return file.isApp()
  })
}).then((matchedFiles) => {
  const fileJson = JSON.stringify(matchedFiles.map((file) => {
    return file.toJson()
  }))
  fs.writeFile('./data/applications.json', fileJson, (err) => {
    if (err) console.log(err)
  })
})
