const describe = require('tape')
const proxyquire = require('proxyquire')
const File = require('../../adapters/fallback/lib/file')

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
      new StubFile('Notepad.lnk', 'C:\\Program Files\\Notepad\\'),
      new StubFile('Readme.md', '/Users/wombat/Documents/'),
    ])
  }
}

describe('adapters/fallback: fileFinder should send back "term" (mac app) search results', function (assert) {
  process.argv.push('term')
  process.argv.push('{}')
  proxyquire('../../adapters/fallback/fileFinder', {
    './lib/finder': StubFinder,
  })
  process.argv = process.argv.slice(0, -1)
  process.send = (results) => {
    const resultTitles = results.map((result) => result.title)
    const expectedOnMac = ['Terminal', 'Docker Quickstart Terminal']
    const expectedOnOther = ['Terminal.app', 'Docker Quickstart Terminal.app']
    const expected = (process.platform === 'darwin') ? expectedOnMac : expectedOnOther
    assert.deepEqual(resultTitles, expected, 'Should receive expected result')
    assert.end()
  }
})

describe('adapters/fallback: fileFinder should send back "note" (win app) search results', function (assert) {
  process.argv.push('note')
  process.argv.push('{}')
  proxyquire('../../adapters/fallback/fileFinder', {
    './lib/finder': StubFinder,
  })
  process.argv = process.argv.slice(0, -1)
  process.send = (results) => {
    const resultTitles = results.map((result) => result.title)
    const expectedOnWin = ['Notepad']
    const expectedOnOther = ['Notepad.lnk']
    const expected = (process.platform === 'win32') ? expectedOnWin : expectedOnOther
    assert.deepEqual(resultTitles, expected, 'Should receive expected result')
    assert.end()
  }
})

describe('adapters/fallback: fileFinder should send back "readme" search results without stripping the file extension', function (assert) {
  process.argv.push('readme')
  process.argv.push('{}')
  proxyquire('../../adapters/fallback/fileFinder', {
    './lib/finder': StubFinder,
  })
  process.argv = process.argv.slice(0, -1)
  process.send = (results) => {
    const resultTitles = results.map((result) => result.title)
    assert.deepEqual(resultTitles, ['Readme.md'], 'Should receive expected result')
    assert.end()
  }
})
