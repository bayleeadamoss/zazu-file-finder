module.exports = (path) => {
  const key = Object.keys(require.cache).find((file) => {
    return file.indexOf(path) !== -1
  })
  delete require.cache[key]
  return require(path)
}
