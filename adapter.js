const Fallback = require('./adapters/fallback')
const MDFind = require('./adapters/osx-mdfind')

var adapter = null
module.exports = function (cwd, env) {
  if (!adapter) {
    if (MDFind.isInstalled()) {
      adapter = new MDFind(cwd, env)
    } else {
      adapter = new Fallback(cwd, env)
    }
  }
  return adapter
}
