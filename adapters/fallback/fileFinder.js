const fuzzyfind = require('fuzzyfind')
const directories = require('../../directories')
const Finder = require('./lib/finder')
const resolvePaths = require('../../lib/resolvepaths')

function search (pluginContext) {
  const { query } = pluginContext
  const { extra } = pluginContext
  const { append } = pluginContext

  if (append) {
    directories.filePath = directories.filePath.concat(extra.filePath || [])
    directories.excludePath = directories.excludePath.concat(extra.excludePath || [])
    directories.excludeName = directories.excludeName.concat(extra.excludeName || [])
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
    return finder.deepFind()
    .then((files) => fuzzyfind(query, files, { accessor: file => file.name }))
    .then((matchedFiles) => matchedFiles.map((file) => file.toJson()))
  }

  findBy(query)
    .then((matchedResults) => {
      if (process.send) {
        process.send(matchedResults)
      } else {
        console.log(`Found results ${JSON.stringify(matchedResults)}`)
      }
    })
    .catch(console.error)
}

(() => {
  const cwd = __dirname
  const query = process.argv.slice(-2)[0]
  const options = process.argv.slice(-1)[0] ? JSON.parse(process.argv.slice(-1)[0]) : {}
  const {append} = options
  const {directories} = options

  search({
    cwd: cwd,
    query: query,
    append: !!append,
    extra: directories,
  })
})()
