const describe = require('tape')
const mkdirp = require('mkdirp')
const os = require('os')
const path = require('path')
const proxyquire = require('proxyquire')

const MDFind = require('../../adapters/osx-mdfind')
const MacFile = require('../../adapters/osx-mdfind/macfile')

const cwd = path.join(os.tmpdir(), 'zazu-file-finder', 'osx-mdfind')
const testPath = path.join(__dirname, '..', 'resources')
const env = {
  append: false,
  directories: {
    appPath: [testPath],
    filePath: [testPath],
  },
}

//  Only test mdfind in osx
if (process.platform === 'darwin') {
  mkdirp.sync(cwd, console.error)

  describe('adapters/osx-mdfind: startCache()', (assert) => {
    console.log(`adapters/osx-mdfind: cwd => ${cwd}`)
    const adapter = new MDFind({ cwd }, env)
    adapter.startCache()
      .then(results => {
        assert.true(results, 'startCache() should return result is not null')
        assert.true(results.length > 1, 'startCache() should return more than 1 result')
        assert.end()
      })
      .catch(error => {
        console.error(error)
        assert.fail(error)
      })
  })

  describe('adapters/osx-mdfind: findApps()', (assert) => {
    const adapter = new MDFind({ cwd }, env)
    adapter.findApps('.')
      .then(apps => {
        assert.true(apps, 'findApps() should return result is not null')
        assert.true(apps.length > 1, 'findApps() should return more than 1 result')
        return adapter.findApps('apple')
      })
      .then(apps => {
        assert.true(apps && apps.length >= 1, 'findApps("apple") should be able to return result')
        assert.equal(apps[0].title, 'Text Apple', 'findApps("apple") should return "Text Apple" app')
        return adapter.findApps('orange')
      })
      .then(apps => {
        assert.true(apps && apps.length >= 1, 'findApps("orange") should be able to return the result')
        assert.equal(apps[0].title, 'Binary Orange', 'findApps("orange") should return "Binary Orange" app')
        assert.end()
      })
      .catch(error => {
        console.error(error)
        assert.fail(error)
      })
  })

  describe('adapters/osx-mdfind: findFiles()', (assert) => {
    const adapter = new MDFind({ cwd }, env)
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

  describe('adapters/osx-mdfind: MacFile', (assert) => {
    assert.equal(new MacFile('/a/b/c.app', 'd', '/app').iconPath, '/app/data/icons/d.png', 'should generate correct iconPath using given name and given cwd')
    assert.equal(new MacFile('/a/b/c.app', 'd').iconPath, 'data/icons/d.png', 'should generate correct iconPath using given name')
    assert.equal(new MacFile('/a/b/c.app').iconPath, 'data/icons/c.png', 'should generate correct iconPath if no name was given')
    assert.end()
  })
}

describe('adapters/osx-mdfind: MacFile: generateIcon() [with icon]', (assert) => {
  const MacFileWithIcon = proxyquire('../../adapters/osx-mdfind/macfile', {
    'fs': { existsSync: () => true },
    'app2png': { convert: () => {
      assert.fail('Should not call app2png if the icons is existed')
      assert.end()
    }},
  })
  const f = new MacFileWithIcon('/a/b/c.app')
  f.generateIcon()
    .then(() => {
      assert.pass('Should return immediately without calling app2png')
      assert.end()
    })
})

describe('adapters/osx-mdfind: MacFile: generateIcon() [without icon]', (assert) => {
  const MacFileWithoutIcon = proxyquire('../../adapters/osx-mdfind/macfile', {
    'fs': { existsSync: () => false },
    'app2png': { convert: () => {
      assert.pass('Should call app2png if no icon exists')
      assert.end()
    }},
  })
  const f = new MacFileWithoutIcon('/a/b/c.app')
  f.generateIcon()
})
