const describe = require('tape')
const proxyquire = require('proxyquire')
const File = require('../lib/file')

class StubFile extends File {
  isDirectory () {
    return false
  }
  loadInfo () {
    this.info = {}
    this.iconPath = ''
  }
}

class StubFinder {
  deepFind () {
    return Promise.resolve([
      new StubFile('Docker Quickstart Terminal.app', '/Applications/Utility/'),
      new StubFile('Terminal.app', '/Applications/Utility/'),
    ])
  }
}

describe('Sorts app name higher', function (assert) {
  assert.plan(1)
  process.argv.push('term')
  process.argv.push('{}')
  proxyquire('../fileFinder', {
    './lib/finder': StubFinder,
  })
  process.argv = process.argv.slice(0, -1)
  process.send = (results) => {
    const resultTitles = results.map((result) => result.title)
    assert.deepEqual(resultTitles, ['Terminal', 'Docker Quickstart Terminal'])
  }
})
