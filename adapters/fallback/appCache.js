const directories = require('../../directories')
const Finder = require('./lib/finder')
const resolvePaths = require('../../lib/resolvepaths')

function setup (pluginContext) {
  const { cwd, extra, append } = pluginContext

  if (append) {
    directories.appPath = directories.appPath.concat(extra.appPath || [])
    directories.excludePath = directories.excludePath.concat(extra.excludePath || [])
    directories.excludeName = directories.excludeName.concat(extra.excludeName || [])
  } else if (extra) {
    extra.appPath && (directories.appPath = extra.appPath)
    extra.excludePath && (directories.excludePath = extra.excludePath)
    extra.excludeName && (directories.excludeName = extra.excludeName)
  }

  const finder = new Finder({
    includePath: resolvePaths(directories.appPath),
    excludePath: resolvePaths(directories.excludePath),
    excludeName: resolvePaths(directories.excludeName),
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
  const { append } = options
  const { directories } = options

  setup({
    cwd: cwd,
    append: !!append,
    extra: directories,
  })()
})()
