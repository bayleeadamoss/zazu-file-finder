const adapter = require('./adapter')

module.exports = ({ cwd }) => {
  return (env = {}) => {
    return adapter(cwd, env).startCache()
  }
}
