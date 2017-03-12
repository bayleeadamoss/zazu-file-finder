const { spawn } = require('child_process')
const MacFile = require('./macfile')

const mdfind = (term, options) => {
  return new Promise((resolve, reject) => {
    const cwd = options.cwd || '.'
    const params = options.include.reduce((memo, dir) => {
      memo.unshift('-onlyin', dir)
      return memo
    }, ['-attr', 'kMDItemDisplayName', term])

    const res = spawn('mdfind', params)
    const data = []
    const err = []

    res.stdout.on('data', (piece) => {
      data.push(piece.toString())
    })

    res.stderr.on('data', (err) => {
      err.push(err.toString())
    })

    res.on('close', (code) => {
      if (code === 0) {
        const files = data.join('').split('\n')
          .filter(Boolean)
          .filter((file) => {
            const badPieces = file.split('/').filter((piece) => {
              return options.exclude.includes(piece)
            })
            return badPieces.length === 0
          })
          .map((file) => {
            const res = file.match(/(.*) {3}kMDItemDisplayName = (.*)/)
            return new MacFile(res[1], res[2], cwd)
          })
        return resolve(files)
      }
      reject(err.join('').trim())
    })
  })
}

module.exports = mdfind
