const Finder = require('./finder')
const resolvePaths = require('../../lib/resolvepaths')

function setup (pluginContext) {
  const { cwd } = pluginContext
  const directories = pluginContext.directories || {}

  const finder = new Finder({
    includePath: resolvePaths(directories.appPath || []),
    excludePath: resolvePaths(directories.excludePath || []),
    excludeName: resolvePaths(directories.excludeName || []),
    cwd,
  })

  return function run () {
    return finder.deepFind()
      .then(files => files.filter(file => !file.isDirectory() && file.isApp()))
      .then(matchedFiles => matchedFiles.map(file => file.toJson()))
      .then(files => {
        if (process.send) {
          process.send(files)
        } else {
          console.log(`Found ${files.length} files, and cannot send back because it's not in fork()`)
        }
      })
  }
}

(() => {
  const cwd = __dirname
  const options = process.argv.slice(-1)[0] ? JSON.parse(process.argv.slice(-1)[0]) : {}
  const { directories } = options

  setup({ cwd, directories })()
})()
