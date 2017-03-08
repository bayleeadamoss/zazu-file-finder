const Fallback = require('./adapters/fallback')
const MDFind = require('./adapters/osx-mdfind')

var adapter = null
module.exports = function (context, env = {}) {
  if (!adapter) {
    if (MDFind.isInstalled()) {
      adapter = new MDFind(context, env)
    } else {
      adapter = new Fallback(context, env)
    }
  }
  return adapter
}
