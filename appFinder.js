const path = require('path')
const filterSort = require('./lib/filterSort')

module.exports = (pluginContext) => {
  const { cwd } = pluginContext
  const applications = require(path.join(cwd, 'data', 'applications.json'))

  return {
    respondsTo: (query) => {
      return query.match(/^\w+$/)
    },
    search: (query, env = {}) => {
      return Promise.resolve(
        filterSort(query, applications, (item) => item.title)
      )
    },
  }
}
