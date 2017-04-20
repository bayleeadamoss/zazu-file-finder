const app2png = require('app2png')
const fs = require('fs')
const path = require('path')
const File = require('../../lib/file')

class MacFile extends File {
  constructor (filePath, name, cwd = '.') {
    super(filePath, name)
    this.iconPath = path.join(cwd, `./data/icons/${this.name}.png`)
  }

  icon () {
    return this.hasIcon() ? this.iconPath : 'fa-file'
  }

  generateIcon () {
    if (this.hasIcon()) return Promise.resolve()
    return app2png.convert(this.path, this.iconPath)
  }

  hasIcon () {
    return fs.existsSync(this.iconPath)
  }
}

module.exports = MacFile
