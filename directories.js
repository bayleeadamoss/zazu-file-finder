const path = require('path')
const os = require('os')

const platform = {}

platform.win32 = {
  filePath: [
    path.join(os.homedir()),
  ],
  appPath: [],
  excludePath: [],
  excludeName: [
    'node_modules',
    'bower_components',
    'vendor',
    'tmp',
    'tags',
    'log',
  ],
}

if (os.platform() === 'win32') {
  if (process.env.USERPROFILE) {
    platform.win32.appPath.push(path.join(process.env.USERPROFILE, 'Desktop'))
  }

  if (process.env.APPDATA) {
    platform.win32.appPath.push(path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs'))
  }
  if (process.env.ProgramData) {
    platform.win32.appPath.push(path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs'))
  }
}

platform.darwin = {
  filePath: [
    path.join(os.homedir()),
  ],
  appPath: [
    path.join('/', 'System', 'Library', 'PreferencePanes'),
    path.join(os.homedir(), 'Applications'),
    path.join('/', 'Applications'),
  ],
  excludePath: [
    path.join(os.homedir(), 'Library'),
  ],
  excludeName: [
    'node_modules',
    'bower_components',
    'vendor',
    'tmp',
    'tags',
    'log',
  ],
}

platform.linux = {
  filePath: [
    path.join(os.homedir(), 'Desktop'),
    path.join(os.homedir(), 'Downloads'),
    path.join(os.homedir(), 'Documents'),
    path.join(os.homedir(), 'Pictures'),
    path.join(os.homedir(), 'Music'),
    path.join(os.homedir(), 'Videos'),
  ],
  appPath: [
    path.join(os.homedir(), 'bin'),
    path.join('/', 'usr', 'bin'),
    path.join('/', 'opt'),
  ],
  excludePath: [],
  excludeName: [
    'node_modules',
    'bower_components',
    'vendor',
    'tmp',
    'tags',
    'log',
    'X11',
  ],
}

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
module.exports = platform[os.platform()] || platform.linux
