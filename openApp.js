const app = process.argv.slice(-1)[0]
const cp = require('child_process')

cp.exec(app)
process.exit(0)
