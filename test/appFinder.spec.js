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
  {
    icon: 'fa-file',
    title: 'Code',
    subtitle: '/Applications/Vitual Studio Code.app',
    value: '/Applications/Vitual Studio Code.app',
    id: '/Applications/Vitual Studio Code.app',
  }
]

const appFinder = require('../appFinder')
const rawCwd = path.join(os.tmpdir())
const cache = path.join(rawCwd, 'data', 'applications.json')
mkdirp.sync(path.join(rawCwd, 'data'))
const updateCache = (items) => {
  fs.writeFileSync(cache, JSON.stringify(items))
  return path.dirname(path.dirname(require.resolve(cache)))
}

describe('Sorts app name higher', function (assert) {
  assert.plan(1)
  const cwd = updateCache(collection)

  appFinder({cwd}).search('term').then((results) => {
    const resultTitles = results.map((result) => result.title)
    assert.deepEqual(resultTitles, ['Terminal', 'Docker Quickstart Terminal'])
  })
})

describe('Re-fetches apps', function (assert) {
  assert.plan(1)
  const cwd = updateCache([collection[0]])

  appFinder({cwd}).search('term').then((results) => {
    const resultTitles = results.map((result) => result.title)
    assert.deepEqual(resultTitles, ['Docker Quickstart Terminal'])
  })
})

describe('Works with space in query', function (assert) {
  assert.plan(1)
  assert.ok(appFinder({cwd: ''}).respondsTo('quickstart ter'))
})

describe('Works with dots and dashes', function (assert) {
  assert.plan(1)
  assert.ok(appFinder({cwd: ''}).respondsTo('some-magic.'))
})

describe('Works with abbreviations', function (assert) {
  assert.plan(1)
  assert.ok(appFinder({cwd: ''}).respondsTo('vsc'))
})
