// Function to map string like "Visual Studio Code" to "vsc"
const toStartWord = str => str.split(" ").map(word => word[0]).join("").toLowerCase()

module.exports = (query, items, accessor) => {
  const regex = new RegExp('\\b' + query, 'i')
  return items.reduce((memo, item) => {
    let ifMatch = isMatch => isMatch && memo.push({ index: 1, raw: item })
    
    // Try to match some full word (query "Store" will match "App Store")
    let matchSomeWord = accessor(item).match(regex)
    matchSomeWord && memo.push({ index: matchSomeWord.index, raw: item })
    if (matchSomeWord) return memo

    // Try to match each start alphabet in each word(query "as" will match "Android Studio")
    let matchStartWord = toStartWord(item.title) === query.toLowerCase()
    ifMatch(matchStartWord)
    if (matchStartWord) return memo

    // Some app like Vitual Studio Code, item.title will be only "Code" 
    // but we want to match its full app name "Vitual Studio Code.app"

    // Try to match each start alphabet in each word(query "vsc" will match "Vitual Studio Code.app")
    let fullAppname = item.value.split("/")
    console.log(fullAppname[fullAppname.length - 1].toLowerCase())
  let matchAppFullName = toStartWord(fullAppname[fullAppname.length - 1]).includes(query.toLowerCase())
    ifMatch(matchAppFullName)
    if (matchAppFullName) return memo

    return memo
  }, []).sort((a, b) => {
    return a.start > b.start ? -1 : 1
  }).map((item) => {
    return item.raw
  })
}
