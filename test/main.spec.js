const describe = require('tape')
const fs = require('fs')
const mkdirp = require('mkdirp')
const os = require('os')
const path = require('path')
const proxyquire = require('proxyquire')
const adapter = require('../adapter')
const appCache = require('../appCache')
const appFinder = require('../appFinder')

const cwd = path.join(os.tmpdir(), 'zazu-file-finder')
const testPath = path.join(__dirname, 'resources')
const env = {
  append: false,
  directories: {
    appPath: [testPath],
    filePath: [testPath],
  },
}

mkdirp.sync(cwd, console.error)

const defaultAdapter = adapter({ cwd }, env)

describe('adapter: startCache()', (assert) => {
  console.log(`adapter: startCache(): cwd => ${cwd}`)
  defaultAdapter.startCache()
    .then(files => {
      assert.true(files, 'startCache() should return non-null result')
      assert.end()
    })
    .catch(error => {
      console.error(error)
      assert.fail(error)
    })
})

describe('adapter: findApps()', (assert) => {
  defaultAdapter.findApps('.')
    .then(files => {
      assert.true(files, 'findApps() should return non-null result')
      assert.end()
    })
    .catch(error => {
      console.error(error)
      assert.fail(error)
    })
})

describe('adapter: findFiles()', (assert) => {
  defaultAdapter.findFiles('test')
    .then(files => {
      assert.true(files, 'findFiles("test") should return non-null result')
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

describe('appCache: should create "data/applications.json" file', (assert) => {
  const appJson = path.join(cwd, 'data', 'applications.json')
  appCache({ cwd }, env)()
    .then(results => {
      assert.true(results, 'Received results')
      assert.true(fs.existsSync(appJson), 'Exists "data/applications.json"')
      assert.end()
    })
    .catch(error => {
      console.error(error)
      assert.fail(error)
    })
})

describe('appFinder: should be able search "data/applications.json" file', (assert) => {
  const appJson = path.join(cwd, 'data', 'applications.json')
  assert.true(fs.existsSync(appJson), 'Exists "data/applications.json"')
  appFinder({ cwd, console }, env).search('textinfo', env)
    .then(results => {
      assert.true(results, 'Received results')
      assert.end()
    })
    .catch(error => {
      console.error(error)
      assert.fail(error)
    })
})

describe('directories: should have default directories for macOS', (assert) => {
  const stubOS = {
    homedir: () => os.homedir(),
    platform: () => 'darwin',
  }
  const directories = proxyquire('../directories', { 'os': stubOS })
  assert.true(directories.appPath.length > 0, 'Should contains 1 or more directories for appPath')
  assert.true(directories.filePath.length > 0, 'Should contains 1 or more directories for filePath')
  assert.end()
})

describe('directories: should have default directories for Linux', (assert) => {
  const stubOS = {
    homedir: () => os.homedir(),
    platform: () => 'linux',
  }
  const directories = proxyquire('../directories', { 'os': stubOS })
  assert.true(directories.appPath.length > 0, 'Should contains 1 or more directories for appPath')
  assert.true(directories.filePath.length > 0, 'Should contains 1 or more directories for filePath')
  assert.end()
})

describe('directories: should have default directories for Windows', (assert) => {
  const stubOS = {
    homedir: () => os.homedir(),
    platform: () => 'win32',
  }
  const directories = proxyquire('../directories', { 'os': stubOS })
  if (os.platform() === 'win32') {
    assert.true(directories.appPath.length > 0, 'Should contains 1 or more directories for appPath')
  }
  assert.true(directories.filePath.length > 0, 'Should contains 1 or more directories for filePath')
  assert.end()
})
