const os = require('os')

module.exports = (paths) => {
  return paths.map((directory) => {
    return directory.replace(/^~/, os.homedir());
  }).filter((d, i, a) => {
    // Unique values
    return i === a.indexOf(d);
  });
}
