const adapter = require('./adapter')
const Cache = require('./lib/cache')

module.exports = (context) => {
  const { cwd } = context
  const cache = new Cache(cwd, 'applications')
  return (env = {}) => {
    return adapter(context, env).startCache()
      .then(results => cache.update(results))
  }
}
