const path = require('path')
const os = require('os')

const platform = {}

platform.win32 = {
  filePath: [
    path.join(os.homedir()),
  ],
  appPath: [
    path.join('C:', 'Program Files (x86)'),
    path.join('C:', 'Program Files'),
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
    path.join(os.homedir()),
    path.join('/', 'usr', 'bin'),
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
  ],
}

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
module.exports = platform[process.platform] || platform.linux
