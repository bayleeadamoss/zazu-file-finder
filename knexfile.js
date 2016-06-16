const path = require('path')

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: path.join(process.cwd(), 'data', 'fs.sqlite')
  },
  useNullAsDefault: true
}
