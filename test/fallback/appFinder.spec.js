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
    title: 'Some-magic.file-with-chars',
    subtitle: '/Applications/Utility/Some-magic-file.with-chars',
    value: '/Applications/Utility/Some-magic.file-with-chars',
    id: '/Applications/Utility/Some-magic.file-with-chars',
  },
  {
    icon: 'fa-file',
    title: 'Terminal',
    subtitle: '/Applications/Utility/Terminal.app',
    value: '/Applications/Utility/Terminal.app',
    id: '/Applications/Utility/Terminal.app',
  },
]

const Fallback = require('../../adapters/fallback')
const rawCwd = path.join(os.tmpdir())
const appFinder = new Fallback(rawCwd, {})
const cache = path.join(rawCwd, 'adapters', 'fallback', 'data', 'applications.json')
mkdirp.sync(path.join(rawCwd, 'adapters', 'fallback', 'data'))
const updateCache = (items) => {
  fs.writeFileSync(cache, JSON.stringify(items))
  appFinder.hasCache = true
}

describe('Sorts app name higher', function (assert) {
  assert.plan(1)
  updateCache(collection)

  appFinder.findApps('term').then((results) => {
    const resultTitles = results.map((result) => result.title)
    assert.deepEqual(resultTitles, ['Terminal', 'Docker Quickstart Terminal'])
  })
})

describe('Re-fetches apps', function (assert) {
  assert.plan(1)
  updateCache([collection[0]])

  appFinder.findApps('term').then((results) => {
    const resultTitles = results.map((result) => result.title)
    assert.deepEqual(resultTitles, ['Docker Quickstart Terminal'])
  })
})
