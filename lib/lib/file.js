const fs = require('fs')
const ONE_HOUR_AGO = Date.now() - 60 * 60 * 1000

class File {
  constructor (filePath) {
    this.filePath = filePath
    this.stats = null
  }

  isViewable (exclude = []) {
    const isHidden = this.filePath.match(/\/\.[^\/]+$/)
    const isExcluded = exclude.indexOf(this.filePath) !== -1
    return !isHidden && !isExcluded
  }

  isDirectory () {
    const isDirectory = this.stats.isDirectory()
    const isSymbolicLink = this.stats.isSymbolicLink()
    const isMacApp = !!this.filePath.match(/\.app$/)
    return isDirectory && !isSymbolicLink && !isMacApp
  }

  toJson () {
    return {
      path: this.filePath,
      isDirectory: this.isDirectory(),
      isRecent: this.stats.mtime > ONE_HOUR_AGO,
      lastModified: this.stats.mtime,
    }
  }

  getStats () {
    return new Promise((accept, reject) => {
      fs.stat(this.filePath, (err, stats) => {
        if (!err) this.stats = stats
        accept(this)
      })
    })
  }
}

module.exports = File
