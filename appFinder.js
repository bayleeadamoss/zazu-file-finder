const adapter = require('./adapter')

module.exports = ({ cwd }) => {
  return {
    respondsTo: (query) => {
      return query.match(/^[\w\-.\\/ ]+$/)
    },
    search: (query, env = {}) => {
      return adapter(cwd, env).findApps(query)
    },
  }
}
