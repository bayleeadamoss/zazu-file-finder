const adapter = require('./adapter')

module.exports = (context) => {
  return (query, env = {}) => {
    return adapter(context, env).findFiles(query)
  }
}
