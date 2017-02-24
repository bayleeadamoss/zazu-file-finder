module.exports = (query, items, accessor) => {
  const regex = new RegExp('\\b' + query, 'i')
  return items.reduce((memo, item) => {
    const match = accessor(item).match(regex)
    match && memo.push({ index: match.index, raw: item })
    return memo
  }, []).sort((a, b) => {
    return a.start > b.start ? -1 : 1
  }).map((item) => {
    return item.raw
  })
}
