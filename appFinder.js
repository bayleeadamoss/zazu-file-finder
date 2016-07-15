const query = process.argv.slice(-1)[0]
const regex = new RegExp(query, 'i')
const applications = require('./data/applications.json')

const filteredApplications = applications.filter((file) => {
  return file.title.match(regex)
})
console.log(JSON.stringify(filteredApplications.slice(0, 9)))
