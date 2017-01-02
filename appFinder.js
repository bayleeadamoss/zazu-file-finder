const path = require('path')
const filterSort = require('./lib/filterSort')
const freshRequire = require('./lib/freshRequire')

module.exports = (pluginContext) => {
  const { cwd } = pluginContext
  const appCachePath = path.join(cwd, 'data', 'applications.json')

  return {
    respondsTo: (query) => {
      return query.match(/^[\w ]+$/)
    },
    search: (query, env = {}) => {
      const applications = freshRequire(appCachePath)
      return Promise.resolve(
        filterSort(query, applications, (item) => item.title + item.subtitle)
      )
    },
  }
}
