const os = require('os')

const unique = (arr) => {
  return arr.filter((el, index, paths) => {
    return index === paths.indexOf(el)
  })
}

module.exports = (paths) => {
  return unique(paths.map((directory) => {
    return directory.replace(/^~/, os.homedir())
  }))
}
