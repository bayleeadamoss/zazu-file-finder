const directories = require('./directories')
const Finder = require('./lib/finder')
const filterSort = require('./lib/filterSort')

const finder = new Finder({
  includePath: directories.filePath,
  excludePath: directories.excludePath,
  excludeName: directories.excludeName,
})

function findBy (query) {
  return finder.deepFind().then((files) => {
    return filterSort(query, files, (file) => file.name)
  }).then((matchedFiles) => {
    return matchedFiles.map((file) => {
      return file.toJson()
    })
  })
}

const query = process.argv.slice(-1)[0]
findBy(query).then((matchedResults) => {
  process.send(matchedResults)
})
