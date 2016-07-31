const os = require('os')
const fs = require('fs')
const path = require('path')
const describe = require('tape')
const mkdirp = require('mkdirp')

const appFinder = require('../appFinder')

const collection = [
  {
    'icon':'fa-file',
    'title':'Docker Quickstart Terminal',
    'subtitle':'/Applications/Utility/Docker Quickstart Terminal.app',
    'value':'/Applications/Utility/Docker Quickstart Terminal.app',
    'id':'/Applications/Utility/Docker Quickstart Terminal.app'
  },
  {
    'icon':'fa-file',
    'title':'Terminal',
    'subtitle':'/Applications/Utility/Terminal.app',
    'value':'/Applications/Utility/Terminal.app',
    'id':'/Applications/Utility/Terminal.app'
  },
]

const cwd = os.tmpdir()
const cache = path.join(cwd, 'data', 'applications.json')
mkdirp.sync(path.join(cwd, 'data'))
fs.writeFileSync(cache, JSON.stringify(collection))

describe('Sorts app name higher', function (assert) {
  assert.plan(1)
  appFinder({cwd}).search('term').then((results) => {
    const resultTitles = results.map((result) => result.title)
    assert.deepEqual(resultTitles, ['Terminal', 'Docker Quickstart Terminal'])
  })
})
