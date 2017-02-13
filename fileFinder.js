const adapter = require('./adapter')

module.exports = ({ cwd }) => {
  return (query, env = {}) => {
    return adapter(cwd, env).findFiles(query)
  }
}
