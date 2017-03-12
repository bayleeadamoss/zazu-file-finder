const describe = require('tape')

const Adapter = require('../../lib/adapter')

describe('lib/adapter: Testing interface', (assert) => {
  const adapter = new Adapter()
  assert.true(adapter, 'Should be able to create Adapter')
  adapter.findFiles('test')
    .then(files => {
      assert.deepEqual(files, [], 'findFiles() should return [] by default')
      return adapter.findApps('test')
    })
    .then(files => {
      assert.deepEqual(files, [], 'findApps() should return [] by default')
      return adapter.startCache()
    })
    .then(files => {
      assert.deepEqual(files, [], 'startCache() should return [] by default')
      assert.end()
    })
})

describe('lib/adapter: processDirectories(): append === false', (assert) => {
  const context = { cwd: __dirname }
  const env = {
    append: false,
    directories: {
      appPath: 'appPath',
      filePath: 'filePath',
      excludePath: 'excludePath',
      excludeName: 'excludeName',
    },
  }
  const adapter = new Adapter(context, env)
  assert.deepEqual(adapter.env.directories, {
    appPath: 'appPath',
    filePath: 'filePath',
    excludePath: 'excludePath',
    excludeName: 'excludeName',
  }, 'Should replace the default directories')
  assert.end()
})

describe('lib/adapter: processDirectories(): append === true', (assert) => {
  const context = { cwd: __dirname }
  const env = {
    append: true,
    directories: {
      appPath: 'appPath',
      filePath: 'filePath',
      excludePath: 'excludePath',
      excludeName: 'excludeName',
    },
  }
  const adapter = new Adapter(context, env)
  assert.true(adapter.env.directories.appPath.length > 1, 'appPath should contains more directories')
  assert.equal(adapter.env.directories.appPath[adapter.env.directories.appPath.length - 1], 'appPath', '"appPath" should be the last item')
  assert.true(adapter.env.directories.filePath.length > 1, 'filePath should contains more directories')
  assert.equal(adapter.env.directories.filePath[adapter.env.directories.filePath.length - 1], 'filePath', '"filePath" should be the last item')
  // assert.true(adapter.env.directories.excludePath.length > 1, 'excludePath should contains more directories')
  assert.equal(adapter.env.directories.excludePath[adapter.env.directories.excludePath.length - 1], 'excludePath', '"excludePath" should be the last item')
  assert.true(adapter.env.directories.excludeName.length > 1, 'excludeName should contains more directories')
  assert.equal(adapter.env.directories.excludeName[adapter.env.directories.excludeName.length - 1], 'excludeName', '"excludeName" should be the last item')
  assert.end()
})
