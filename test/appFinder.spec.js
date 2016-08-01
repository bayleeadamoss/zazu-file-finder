const os = require('os')
const fs = require('fs')
const path = require('path')
const describe = require('tape')
const mkdirp = require('mkdirp')

const collection = [
  {
    icon: 'fa-file',
    title: 'Docker Quickstart Terminal',
    subtitle: '/Applications/Utility/Docker Quickstart Terminal.app',
    value: '/Applications/Utility/Docker Quickstart Terminal.app',
    id: '/Applications/Utility/Docker Quickstart Terminal.app',
  },
  {
    icon: 'fa-file',
    title: 'Terminal',
    subtitle: '/Applications/Utility/Terminal.app',
    value: '/Applications/Utility/Terminal.app',
    id: '/Applications/Utility/Terminal.app',
  },
]

const appFinder = require('../appFinder')
const rawCwd = path.join(os.tmpdir())
const cache = path.join(rawCwd, 'data', 'applications.json')
mkdirp.sync(path.join(rawCwd, 'data'))
const updateCache = (items) => {
  fs.writeFileSync(cache, JSON.stringify(items))
}
const cwd = path.dirname(path.dirname(require.resolve(cache)))

describe('Sorts app name higher', function (assert) {
  assert.plan(1)
  updateCache(collection)

  appFinder({cwd}).search('term').then((results) => {
    const resultTitles = results.map((result) => result.title)
    assert.deepEqual(resultTitles, ['Terminal', 'Docker Quickstart Terminal'])
  })
})

describe('Re-fetches apps', function (assert) {
  assert.plan(1)
  updateCache([collection[0]])

  appFinder({cwd}).search('term').then((results) => {
    const resultTitles = results.map((result) => result.title)
    assert.deepEqual(resultTitles, ['Docker Quickstart Terminal'])
  })
})
