function everyLimit(limit, cb, flush) {
  var responses = []
  var length = 0
  return () => {
    responses.push(arguments)
    length++
    if (length === limit) {
      cb(responses)
      responses = []
      length = 0
    }
  }
}


let i = 0
let total = 0
const cb = everyLimit(10, (responses) => {
  total += responses.length
  console.log(total)
}, )
while(i < 1002) {
  cb(i++)
}
