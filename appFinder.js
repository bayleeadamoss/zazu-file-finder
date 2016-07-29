const path = require('path')

module.exports = (pluginContext) => {
  const { cwd } = pluginContext
  const applications = require(path.join(cwd, 'data', 'applications.json'))

  return {
    respondsTo: (query) => {
      return query.match(/^\w+$/)
    },
    search: (query, env = {}) => {
      const regex = new RegExp('\\b' + query, 'i')
      return new Promise((resolve, reject) => {
        const filteredApplications = applications.filter((file) => {
          return file.title.match(regex)
        })
        resolve(filteredApplications.slice(0, 6))
      })
    },
  }
}
