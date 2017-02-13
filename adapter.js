const Fallback = require('./adapters/fallback')

var adapter = null
module.exports = function (cwd, env) {
  if (!adapter) {
    adapter = new Fallback(cwd, env)
  }
  return adapter
}
