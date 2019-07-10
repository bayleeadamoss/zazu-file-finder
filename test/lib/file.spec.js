const describe = require('tape')
const os = require('os')
const proxyquire = require('proxyquire')

const File = require('../../lib/file')

const stubOsMac = { homedir: () => os.homedir(), platform: () => 'darwin' }
const stubOsWin = { homedir: () => os.homedir(), platform: () => 'win32' }
const stubOsLinux = { homedir: () => os.homedir(), platform: () => 'linux' }

const FileMac = proxyquire('../../lib/file', { 'os': stubOsMac })
const FileWin = proxyquire('../../lib/file', { 'os': stubOsWin })
const FileLinux = proxyquire('../../lib/file', { 'os': stubOsLinux })

describe('lib/file: constructor', (assert) => {
  assert.equal(new File('/a/b/c', 'd').path, '/a/b/c', '.path should be the given path')
  assert.equal(new File('/a/b/c', 'd').name, 'd', '.name should be the given name')
  assert.equal(new File('/a/b/c').name, 'c', '.name should be the basename if no given name')
  assert.equal(new FileMac('/a/b/c.app').name, 'c', '.name should strip the file extension if it is mac app')
  assert.equal(new FileMac('/a/b/c.prefPane').name, 'c', '.name should strip the file extension if it is mac prefPane')
  assert.equal(new FileWin('Notepad.lnk').name, 'Notepad', '.name should strip the file extension if it is win .lnk')
  assert.equal(new FileWin('Notepad.exe').name, 'Notepad', '.name should strip the file extension if it is win .exe')
  assert.equal(new FileWin('Photos.appref-ms').name, 'Photos', '.name should strip the file extension if it is win .appref-ms')
  assert.end()
})

describe('lib/file: isApp()', (assert) => {
  assert.true(new FileMac('/a/b/c.app').isApp(), 'should identify the mac app')
  assert.true(new FileMac('/a/b/c.prefPane').isApp(), 'should identify the mac prefPane as app')
  assert.true(new FileWin('Notepad.lnk').isApp(), 'should identify win .lnk as app')

  const fileOnLinux = new FileLinux('/a/b/c')
  fileOnLinux.stats = { mode: 0b101101101 }
  assert.true(fileOnLinux.isApp(), 'should identify "r-xr-xr-x" executable as app')
  fileOnLinux.stats = { mode: 0b001000000 }
  assert.true(fileOnLinux.isApp(), 'should identify "--x------" executable as app')
  fileOnLinux.stats = { mode: 0b000001000 }
  assert.true(fileOnLinux.isApp(), 'should identify "-----x---" executable as app')
  fileOnLinux.stats = { mode: 0b000000001 }
  assert.true(fileOnLinux.isApp(), 'should identify "--------x" executable as app')
  fileOnLinux.stats = { mode: 0b100100100 }
  assert.false(fileOnLinux.isApp(), 'should identify "r--r--r--" as not an app')
  fileOnLinux.stats = undefined
  assert.false(fileOnLinux.isApp(), 'should return false if .stats is not available')
  assert.end()
})
