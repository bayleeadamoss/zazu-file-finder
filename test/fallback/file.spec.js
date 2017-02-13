const describe = require('tape')
const fs = require('fs')
const path = require('path')
const os = require('os')

const File = require('../../adapters/fallback/lib/file')

//  Do the real world test on macOS system
if (process.platform === 'darwin') {
  const testCwd = path.join(os.tmpdir(), 'test', 'file')

  describe('File.constructor() should initialize all the members', (assert) => {
    //  Using system app 'Terminal.app' for the testing.
    const app = new File('Terminal.app', '/Applications/Utilities', { cwd: testCwd })

    assert.equal(app.name, 'Terminal.app')
    assert.equal(app.path, '/Applications/Utilities/Terminal.app')
    assert.equal(app.options.cwd, testCwd)
    assert.notEqual(app.info, {})
    assert.ok(app.info.CFBundleIconFile)
    assert.ok(app.iconPath.indexOf('data/icons/Terminal.app-') === 0,
      'Testing whether contains generated icon path')
    assert.end()
  })

  describe('File.generateIcon() should generate the icons', (assert) => {
    const app = new File('Terminal.app', '/Applications/Utilities', { cwd: testCwd })
    //  Wait a little bit for the icon generation, 1 second should be enough for a single icon
    setTimeout(() => {
      const iconAbsPath = path.join(testCwd, app.iconPath)
      assert.true(fs.existsSync(iconAbsPath), 'Testing whether icon has been generated or not.')
      assert.end()
    }, 1000)
  })
}
