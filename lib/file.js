const fs = require('fs')
const os = require('os')
const path = require('path')
const plist = require('plist')
const HOME_REGEX = new RegExp('^' + os.homedir())
const nativeImage = require('electron').nativeImage

class File {
    constructor(name, dir) {
        this.name = name
        this.path = path.join(dir, name)
        this.stats = null
    }

    isViewable(exclude) {
        const isHidden = this.path.match(/\/\.[^/]+$/)
        const isExcluded = exclude.indexOf(this.path) !== -1
        return !isHidden && !isExcluded
    }

    isApp() {
        return this.isAppMac() || this.isAppWindows() || this.isAppLinux()
    }

    isAppMac() {
        if (process.platform !== 'darwin') {
            return false
        }

        return !!this.name.match(/\.(prefPane|app)$/)
    }

    isAppWindows() {
        if (process.platform !== 'win32') {
            return false
        }

        return !!this.name.match(/\.(exe)$/)
    }

    isAppLinux() {
        if (process.platform === 'win32' || process.platform === 'darwin') {
            return false
        }
        const mode = this.stats.mode
        return !!(((mode >> 6) & 1) || (((mode << 3) >> 6) & 1) || (((mode << 6) >> 6) & 1))
    }

    title() {
        const fileName = this.name.split('.')[0]
        if (process.platform !== 'darwin' || !this.isApp()) {
            return fileName
        }
        const info = this.info()
        return info.CrAppModeShortcutName || info.CFBundleDisplayName || info.CFBundleName || fileName
    }

    isDirectory() {
        const isDirectory = this.stats.isDirectory()
        const isSymbolicLink = this.stats.isSymbolicLink()
        return isDirectory && !isSymbolicLink && !this.isAppMac()
    }

    isBroken() {
        return !this.stats
    }

    relativePath() {
        return this.path.replace(HOME_REGEX, '~')
    }

    info() {
        try {
            const infoPath = path.join(this.path, 'contents', 'Info.plist')
            return plist.parse(fs.readFileSync(infoPath).toString())
        } catch (e) {
            return {}
        }
    }

    toJson() {
        return {
            icon: this.isDirectory() ? 'fa-folder' : getIcon(),
            title: this.title(),
            subtitle: this.relativePath(),
            value: this.relativePath(),
            id: this.relativePath(),
        }
    }

    getStats () {
        return new Promise((resolve, reject) => {
            fs.stat(this.path, (err, stats) => {
                if (!err) this.stats = stats
                resolve()
            })
        })
    }
}

module.exports = File

function getIcon() {
    let iconImg = 'fa-file';

    // TODO Refactoring & Test
    if (value.id[0] === '~') {
        value.id = value.id.replace('~', process.env.HOME);
    }
    if (value.id.split('.').indexOf('app') >= 0) {
        const fs = require('fs');
        fs.readdirSync(value.id + '/Contents/Resources/').forEach(file => {
            if (file.split('.').indexOf('icns') >= 0) {
                const pathTmp = app.getAppPath() + '/tmp/' + new Buffer(file).toString('base64') + '.png';
                const exec = require('child_process').execSync;
                exec('sips -Z 25 -s format png "' + value.id + '/Contents/Resources/' + file + '" --out "' + pathTmp + '"');
                let image = nativeImage.createFromPath(pathTmp)
                exec('rm ' + pathTmp);
                iconImg = 'data: image/png;base64,' + image.toPNG().toString('base64')
            }
        });
    }
}