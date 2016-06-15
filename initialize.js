require('datejs')
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('data/files.db')
var Finder = require('fs-finder')
var fs = require('fs')

const getIsRecent = (lastModified) => {
  if (Date.parse('1 hour ago') < lastModified) {
    return 1
  }
  return 0
}

var start = new Date()
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS files(
    type TEXT,
    path TEXT UNIQUE,
    isRecent INTEGER,
    lastModified INTEGER,
    lastProcessed INTEGER
  );`)

  Finder.from('/Users/blainesch/projects/zazu').find((files) => {
    var found = new Date()
    let values = []
    console.log('found', files.length)
    let processed = 0
    files.forEach((file) => {
      fs.stat(file, (err, stats) => {
        const type = stats.isFile() ? 'file' : 'directory'
        const lastModified = stats.mtime
        const isRecent = getIsRecent(lastModified)
        values.push(`("${type}", "${file}", ${isRecent}, ${lastModified.getTime()}, datetime())`)
        processed++
      })
    })
    const interval = setInterval(() => {
      if (processed >= files.length) {
        var stats = new Date()
        console.log('beep')
        values.forEach((value) => {
          db.run("INSERT INTO files VALUES " + value)
        })
        var done = new Date()
        console.log('full time', done - start)
        console.log('db time', done - stats)
        console.log('stats time', stats - found)
        console.log('find time', found - start)
        clearInterval(interval)
        db.close();
      }
    }, 100)
  })
});
