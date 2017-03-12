const describe = require('tape')
const mkdirp = require('mkdirp')
const os = require('os')
const path = require('path')
const proxyquire = require('proxyquire')
const File = require('../../lib/file')
const Fallback = require('../../adapters/fallback')

class StubFile extends File {
  isDirectory () {
    return false
  }
}

class StubFinder {
  deepFind () {
    return Promise.resolve([
      //  macOS app path with name
      new StubFile('/Applications/Utility/Docker Quickstart Terminal.app', 'Docker Quickstart Terminal'),
      //  macOS app path without given name, the name will be parsed from the path
      new StubFile('/Applications/Utility/Terminal.app'),
      //  Windows app path without given name, which should not be parsed on other platform
      new StubFile('C:\\Program Files\\Notepad\\Notepad.lnk'),
      //  Windows app path with name, the name will be used for matching
      new StubFile('C:\\Program Files\\Notepad\\Notepad Plus.lnk', 'Notepad Plus'),
      //  Unix file path without name, which be parsed from the path
      new StubFile('/Users/wombat/Documents/Readme.md'),
    ])
  }
}

const cwd = path.join(os.tmpdir(), 'zazu-file-finder', 'fallback')
const testPath = path.join(__dirname, '..', 'resources')
const env = {
  append: false,
  directories: {
    appPath: [testPath],
    filePath: [testPath],
  },
}

mkdirp.sync(cwd, console.error)

describe('adapters/fallback/fileFinder: should send back "term" (mac app) search results', function (assert) {
  process.argv.push('term')
  process.argv.push('{}')
  proxyquire('../../adapters/fallback/fileFinder', { './finder': StubFinder })
  process.argv = process.argv.slice(0, -1)
  process.send = (results) => {
    const resultTitles = results.map((result) => result.title)
    const expectedOnMac = ['Terminal', 'Docker Quickstart Terminal']
    const expectedOnOther = ['Terminal.app', 'Docker Quickstart Terminal']
    const expected = (process.platform === 'darwin') ? expectedOnMac : expectedOnOther
    assert.deepEqual(resultTitles, expected, 'Should receive expected result')
    assert.end()
  }
})

describe('adapters/fallback/fileFinder: should send back "note" (win app) search results', function (assert) {
  process.argv.push('note')
  process.argv.push('{}')
  proxyquire('../../adapters/fallback/fileFinder', { './finder': StubFinder })
  process.argv = process.argv.slice(0, -1)
  process.send = (results) => {
    const resultTitles = results.map((result) => result.title)
    const expectedOnWin = ['Notepad', 'Notepad Plus']
    const expectedOnOther = ['Notepad Plus', 'C:\\Program Files\\Notepad\\Notepad.lnk']
    const expected = (process.platform === 'win32') ? expectedOnWin : expectedOnOther
    assert.deepEqual(resultTitles, expected, 'Should receive expected result')
    assert.end()
  }
})

describe('adapters/fallback/fileFinder: should send back "readme" search results without stripping the file extension', function (assert) {
  process.argv.push('readme')
  process.argv.push('{}')
  proxyquire('../../adapters/fallback/fileFinder', { './finder': StubFinder })
  process.argv = process.argv.slice(0, -1)
  process.send = (results) => {
    const resultTitles = results.map((result) => result.title)
    assert.deepEqual(resultTitles, ['Readme.md'], 'Should receive expected result')
    assert.end()
  }
})

describe('adapters/fallback: startCache()', (assert) => {
  const adapter = new Fallback({ cwd }, env)
  adapter.startCache()
    .then(apps => {
      const titles = apps.map(app => app.title)
      let expected
      switch (process.platform) {
        case 'darwin':
          expected = ['Binary Orange', 'Text Apple', 'TiffIcon']
          break
        case 'win32':
          expected = []
          break
        default:
          expected = ['daisy', 'honeygold']
          break
      }
      //  verify the array contains, the order doesn't matter.
      assert.equal(titles.length, expected.length, `Should found ${expected.length} in cache`)
      expected.forEach(t => assert.true(titles.indexOf(t) > -1, `Should contains ${t} in cache`))
      assert.end()
    })
    .catch(error => {
      console.error(error)
      assert.fail(error)
    })
})

describe('adapters/fallback: findFiles()', (assert) => {
  const adapter = new Fallback({ cwd }, env)
  adapter.findFiles('test')
    .then(files => {
      assert.true(files, 'findFiles("test") should return result is not null')
      assert.true(files.length > 1, 'findFiles("test") should return more than 1 result')
      assert.true(files.find(file => file.title === 'test.md'), 'findFiles("test") should find "test.md" file')
      assert.true(files.find(file => file.title === 'demo test file.txt'), 'findFiles("test") should find "demo test file.txt" file')
      assert.false(files.find(file => file.title === 'readme.txt'), 'findFiles("test") should not find "readme.txt" file')
      assert.end()
    })
    .catch(error => {
      console.error(error)
      assert.fail(error)
    })
})
