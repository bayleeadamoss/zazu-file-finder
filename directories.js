const path = require('path')
const os = require('os')

const platform = {}

platform.win32 = {
  filePath: [
    path.join(os.homedir()),
  ],
  appPath: [
    path.join(process.env.USERPROFILE, 'Desktop'),
    path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
  ],
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
module.exports = platform[process.platform] || platform.linux
