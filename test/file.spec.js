const describe = require('tape')
const fs = require('fs')
const path = require('path')
const os = require('os')

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

describe('File.findBestIcon() should return size "128" if it exists', (assert) => {
  const iconSetWithout2x = [
    'icon_128x128.png',
    'icon_16x16.png',
    'icon_256x256.png',
    'icon_32x32.png',
    'icon_512x512.png',
  ]
  const iconSetWith2x = [
    'icon_128x128@2x.png',
    'icon_128x128.png',
    'icon_16x16.png',
    'icon_256x256.png',
    'icon_32x32.png',
    'icon_512x512.png',
    'icon_16x16@2x.png',
    'icon_256x256@2x.png',
    'icon_32x32@2x.png',
  ]

  const f = new StubFile('Terminal.app', '/Applications/Utilities')
  assert.equal(f.findBestIcon(iconSetWithout2x), 'icon_128x128.png')
  assert.equal(f.findBestIcon(iconSetWith2x), 'icon_128x128.png')
  assert.end()
})

describe('File.findBestIcon() should return size "256" if it doesn\'t exist and have 256', (assert) => {
  const iconSetWithout128 = [
    'icon_16x16.png',
    'icon_256x256.png',
    'icon_32x32.png',
    'icon_512x512.png',
  ]

  const f = new StubFile('Terminal.app', '/Applications/Utilities')
  assert.equal(f.findBestIcon(iconSetWithout128), 'icon_256x256.png')
  assert.end()
})

describe('File.findBestIcon() should return largest size if no prefered size exists', (assert) => {
  const iconSetWithout128and256 = [
    'icon_16x16.png',
    'icon_32x32.png',
    'icon_512x512.png',
    'icon_16x16@2x.png',
    'icon_32x32@2x.png',
  ]

  const f = new StubFile('Terminal.app', '/Applications/Utilities')
  assert.equal(f.findBestIcon(iconSetWithout128and256), 'icon_512x512.png')
  assert.end()
})

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
