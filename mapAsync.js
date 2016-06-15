const mapAsync = (items, mapFn) => {
  const length = items.length
  let resolved = 0
  return new Promise((accept) => {
    if (resolved === length) accept(items)
    items.forEach((value, index) => {
      mapFn(value, (newValue) => {
        items[index] = newValue
        resolved++
        if (resolved === length) accept(items)
      })
    })
  })
}

module.exports = mapAsync
