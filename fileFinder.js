const directories = require('./directories')
const Finder = require('./lib/finder')
const filterSort = require('./lib/filterSort')
const resolvePaths = require('./lib/resolvepaths')

function search(pluginContext) {
  const { query } = pluginContext
  const { cwd } = pluginContext
  const { extra } = pluginContext
  const { append } = pluginContext

  if (append) {
    directories.filePath = directories.filePath.concat(extra.filePath || []);
    directories.excludePath = directories.excludePath.concat(extra.excludePath || []);
    directories.excludeName = directories.excludeName.concat(extra.excludeName || []);
  } else if (extra) {
    extra.filePath && (directories.filePath = extra.filePath)
    extra.excludePath && (directories.excludePath = extra.excludePath)
    extra.excludeName && (directories.excludeName = extra.excludeName)
  }

  const finder = new Finder({
    includePath: resolvePaths(directories.filePath),
    excludePath: resolvePaths(directories.excludePath),
    excludeName: resolvePaths(directories.excludeName),
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

  findBy(query).then((matchedResults) => {
    process.send(matchedResults)
  })
}

(() => {
  const cwd = __dirname
  const query = process.argv.slice(-2)[0]
  const options = process.argv.slice(-1)[0] ? JSON.parse(process.argv.slice(-1)[0]) : {}
  const {append} = options;
  const {directories} = options;

  search({
    cwd: cwd,
    query: query,
    append: !!append,
    extra: directories
  })
})()
