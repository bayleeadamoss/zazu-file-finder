const describe = require('tape')
const fs = require('fs')
const os = require('os')
const path = require('path')
const rewire = require('rewire')

const appInfo = rewire('../lib/appInfo')

const TERMINAL_APP = 'Terminal.app'
const TERMINAL_APP_PATH = '/Applications/Utilities/Terminal.app'

describe('appInfo.sha1() should be able to generate SHA1 hash', (assert) => {
  const sha1 = appInfo.__get__('sha1')

  assert.equal(sha1(''), 'da39a3ee5e6b4b0d3255bfef95601890afd80709')
  assert.equal(sha1('zazu'), '937a4f319bae4b36c0910c5e4338ba4dd02b9a81')
  assert.equal(sha1(TERMINAL_APP_PATH), 'a4336d71081c5b8029d8484c74a9dd1f94c8cd00')
  assert.end()
})

describe('appInfo.getAppIconCachePath() should return the relative path in correct format', (assert) => {
  assert.equal(appInfo.getAppIconCachePath(TERMINAL_APP_PATH, TERMINAL_APP),
    path.join('data', 'icons', 'Terminal.app-a4336d71081c5b8029d8484c74a9dd1f94c8cd00.png'))
  assert.end()
})

if (process.platform === 'darwin' || process.platform === 'linux') {
  describe('appInfo.getAppIcnsPath() should return ICNS path based on given info (with/without extension)', (assert) => {
    assert.equal(appInfo.getAppIcnsPath(TERMINAL_APP_PATH, { CFBundleIconFile: 'Terminal' }),
      '/Applications/Utilities/Terminal.app/Contents/Resources/Terminal.icns')
    assert.equal(appInfo.getAppIcnsPath(TERMINAL_APP_PATH, { CFBundleIconFile: 'Terminal.icns' }),
      '/Applications/Utilities/Terminal.app/Contents/Resources/Terminal.icns')
    assert.equal(appInfo.getAppIcnsPath(TERMINAL_APP_PATH, { CFBundleIconFile: 'Terminal.tiff' }),
      '/Applications/Utilities/Terminal.app/Contents/Resources/Terminal.tiff')
    assert.equal(appInfo.getAppIcnsPath(TERMINAL_APP_PATH, {}), '')
    assert.end()
  })
}

describe('appInfo.findBestIcon() should return size "128" if it exists', (assert) => {
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

  const findBestIcon = appInfo.__get__('findBestIcon')

  assert.equal(findBestIcon(iconSetWithout2x), 'icon_128x128.png')
  assert.equal(findBestIcon(iconSetWith2x), 'icon_128x128.png')
  assert.end()
})

describe('appInfo.findBestIcon() should return size "256" if it doesn\'t exist and have 256', (assert) => {
  const iconSetWithout128 = [
    'icon_16x16.png',
    'icon_256x256.png',
    'icon_32x32.png',
    'icon_512x512.png',
  ]

  const findBestIcon = appInfo.__get__('findBestIcon')

  assert.equal(findBestIcon(iconSetWithout128), 'icon_256x256.png')
  assert.end()
})

describe('appInfo.findBestIcon() should return largest size if no prefered size exists', (assert) => {
  const iconSetWithout128and256 = [
    'icon_16x16.png',
    'icon_32x32.png',
    'icon_512x512.png',
    'icon_16x16@2x.png',
    'icon_32x32@2x.png',
  ]

  const findBestIcon = appInfo.__get__('findBestIcon')

  assert.equal(findBestIcon(iconSetWithout128and256), 'icon_512x512.png')
  assert.end()
})

//  real world test on macOS
if (process.platform === 'darwin') {
  describe('appInfo.loadAppInfoMac() should be able load plist', (assert) => {
    const loadAppInfoMac = appInfo.__get__('loadAppInfoMac')
    const info = loadAppInfoMac(TERMINAL_APP_PATH)

    assert.true(Object.keys(info).length > 0)
    assert.equal(info.CFBundleIconFile, 'Terminal')
    assert.equal(info.CFBundleName, 'Terminal')
    assert.equal(info.CFBundleDisplayName, 'Terminal')
    assert.end()
  })

  describe('appInfo.convertIcnsToPNG() should be able to convert .icns to a PNG file', (assert) => {
    const convertIcnsToPNG = appInfo.__get__('convertIcnsToPNG')
    assert.plan(1)
    const pngPath = path.join(os.tmpdir(), 'test', 'terminal.png')
    convertIcnsToPNG(appInfo.getAppIcnsPath(TERMINAL_APP_PATH, { CFBundleIconFile: 'Terminal' }), pngPath)
      .then(() => fs.existsSync(pngPath)
        ? assert.pass('Successfully converted ICNS to PNG file')
        : assert.fail('Cannot convert ICNS to PNG')
      )
      .catch(error => assert.fail(error))
  })

  describe('appInfo.convertTiffToPNG() should be able to convert .tiff to a PNG file', (assert) => {
    const convertTiffToPNG = appInfo.__get__('convertTiffToPNG')
    assert.plan(1)
    const pngPath = path.join(os.tmpdir(), 'test', 'tiff.png')
    const tiffPath = path.join(__dirname, 'resources', 'icon.tiff')
    convertTiffToPNG(tiffPath, pngPath)
      .then(() => fs.existsSync(pngPath)
        ? assert.pass('Successfully converted TIFF to PNG file')
        : assert.fail('Cannot convert TIFF to PNG')
      )
      .catch(error => assert.fail(error))
  })

  describe('appInfo.generateIcon() should be able to generate a PNG file for Terminal.app', (assert) => {
    assert.plan(1)
    const pngPath = path.join(os.tmpdir(), 'test', 'generated-terminal-icon.png')
    let icnsPath = appInfo.getAppIcnsPath(TERMINAL_APP_PATH, { CFBundleIconFile: 'Terminal' })
    appInfo.generateIcon(icnsPath, pngPath)
      .then(() => fs.existsSync(pngPath)
        ? assert.pass('Successfully generated a PNG file')
        : assert.fail('Cannot generate PNG icon')
      )
      .catch(error => assert.fail(error))
  })

  describe('appInfo.generateIcon() should be able to generate a PNG file for non-exist app path', (assert) => {
    assert.plan(1)
    const pngPath = path.join(os.tmpdir(), 'test', 'generated-default-icon.png')
    appInfo.generateIcon('/Applications/not-exists-application', pngPath)
      .then(() => fs.existsSync(pngPath)
        ? assert.pass('Successfully generated a PNG file')
        : assert.fail('Cannot generate PNG icon')
      )
      .catch(error => assert.fail(error))
  })
}
