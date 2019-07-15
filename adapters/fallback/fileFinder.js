const fuzzyfind = require('fuzzyfind')
const Finder = require('./finder')
const resolvePaths = require('../../lib/resolvepaths')

function search (pluginContext) {
  const { query } = pluginContext
  const directories = pluginContext.directories || {}

  const finder = new Finder({
    includePath: resolvePaths(directories.filePath || []),
    excludePath: resolvePaths(directories.excludePath || []),
    excludeName: resolvePaths(directories.excludeName || []),
  })

  function findBy (query) {
    return finder
      .deepFind()
      .then(files => fuzzyfind(query, files, { accessor: file => file.name }))
      .then(matchedFiles => matchedFiles.map(file => file.toJson()))
  }

  findBy(query)
    .then(matchedResults => {
      if (process.send) {
        process.send(matchedResults)
      } else {
        console.log(`Found results ${JSON.stringify(matchedResults)}`)
      }
    })
    .catch(console.error)
}

;(() => {
  const cwd = __dirname
  const query = process.argv.slice(-2)[0]
  const options = process.argv.slice(-1)[0] ? JSON.parse(process.argv.slice(-1)[0]) : {}
  const { directories } = options

  search({ cwd, query, directories })
})()
