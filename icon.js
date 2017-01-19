const iconutil = require('iconutil')
const fs = require('fs')

const path = '/Applications/Zazu.app/Contents/Resources/icon.icns'

const getSize = (name) => {
  return name.match(/\d+/)[0]
}

iconutil.toIconset(path, (err, icons) => {
  const biggestIcon = Object.keys(icons).reduce((biggest, latest) => {
    const biggestSize = getSize(biggest)
    const latestSize = getSize(latest)
    return biggestSize > latestSize ? biggest : latest
  }, 'icon_0x0.png')
  fs.writeFile('Zazu.app.png', icons[biggestIcon], 'binary', (err) => {
    if (err) throw err
    console.log('File saved.')
  })
})
