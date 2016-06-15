var Datastore = require('nedb')
// id, type, path, lastUpdated, lastProcessed
var db = new Datastore({
  filename: 'data/files.db',
  autoload: true,
})

var doc = {
  type: 'directory',
  path: '/Users/blainesch/projects',
}

db.insert(doc, function (err, newDoc) {
  console.log({newDoc: newDoc})
});

/**
 * 4 buckets based on last modificatoin date
 * 1: 0-10
 * 2: 10-60
 * 3: 60-1440
 * 4: 1440+
 *
 * Each bucket has acceptable ranges:
 * 1: <= 60 seconds
 * 2: <= 3 minutes
 * 3: <= 6 minutes
 * 4: <= 10 minutes
 *
 * We ALWAYS run the `seconds` bucket. We also try and get 50k directories based
 * on this criteria:
 *
 * If over acceptable range, go first
 * If bucket `minutes` go second
 * If bucket `hours` go third
 * If bucket `days` go third
 */

/**
 * processing means:
 * update info on itself, and all it's immediate children. Non recursive.
 */
