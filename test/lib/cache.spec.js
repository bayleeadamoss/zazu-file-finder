const describe = require('tape')
const os = require('os')
const fs = require('fs')
const path = require('path')

const Cache = require('../../lib/cache')
const freshRequire = require('../../lib/freshRequire')

const collection = [
  {
    icon: 'fa-file',
    title: 'Docker Quickstart Terminal',
    subtitle: '/Applications/Utility/Docker Quickstart Terminal.app',
    value: '/Applications/Utility/Docker Quickstart Terminal.app',
  },
  {
    icon: 'fa-file',
    title: 'Some-magic.file-with-chars',
    subtitle: '/Applications/Utility/Some-magic-file.with-chars',
    value: '/Applications/Utility/Some-magic.file-with-chars',
  },
  {
    icon: 'fa-file',
    title: 'Terminal',
    subtitle: '/Applications/Utility/Terminal.app',
    value: '/Applications/Utility/Terminal.app',
  },
]

const cwd = path.join(os.tmpdir(), 'zazu-file-finder', 'cache')

describe('lib/cache: Cache can be stored and searched', function (assert) {
  const cache = new Cache(cwd, 'cache1')
  cache.update(collection)
    .then(results => {
      const cachePath = path.join(cwd, 'data', 'cache1.json')
      assert.true(fs.existsSync(cachePath), 'Cache data file should be created')
      const db = freshRequire(cachePath)
      assert.equal(db.length, collection.length, 'Stored db should have same amount of items as the given one')
      collection.forEach((item, index) => assert.deepEqual(db[index], item, `Item[${index}] is as expected`))
      return cache.search('term')
    })
    .then(results => results.map(result => result.title))
    .then(titles => {
      assert.deepEqual(titles, ['Terminal', 'Docker Quickstart Terminal'], 'Search results should be sorted as expected')
      assert.end()
    })
    .catch(error => {
      console.error(error)
      assert.fail(error)
    })
})

describe('lib/cache: Result should match the expected value', function (assert) {
  const cache = new Cache(cwd, 'cache2')
  cache.update([collection[0]])
    .then(results => {
      assert.true(fs.existsSync(path.join(cwd, 'data', 'cache2.json')), 'Cache data should be stored to data/cache2.json')
      return cache.search('term')
    })
    .then(results => results.map(result => result.title))
    .then(titles => {
      assert.deepEqual(titles, ['Docker Quickstart Terminal'], 'Result should be expected')
      assert.end()
    })
    .catch(error => {
      console.error(error)
      assert.fail(error)
    })
})
