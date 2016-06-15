const fs = require('fs')
fs.watch('/Users/blainesch/projects/zazu', (event, filename) => {
  console.log(event, filename);
});
