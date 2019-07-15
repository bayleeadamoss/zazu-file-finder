const adapter = require('./adapter')
const Cache = require('./lib/cache')

module.exports = (context) => {
  return {
    respondsTo: (query) => {
      return query.match(/^[\w\-.\\/ ]+$/)
    },
    search: (query, env = {}) => {
      const { cwd, console } = context
      const cache = new Cache(cwd, 'applications')

      return cache.search(query, env)
        .then(results => results.length > 0 ? results : adapter(context, env).findApps(query))
        .catch(error => console.log('error', error))
    },
  }
}
