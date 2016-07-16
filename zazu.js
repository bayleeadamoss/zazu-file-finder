module.exports = {
  name: 'File Finder',
  version: '0.0.1',
  author: 'blainesch',
  description: 'Find files and applications on your computer easily.',
  homepage: 'https://github.com/tinytacoteam/zazu-file-finder',
  git: 'git@github.com:tinytacoteam/zazu-file-finder.git',
  install: 'node appCache.js',
  blocks: {
    external: [
      {
        id: 1,
        type: 'ServiceScript',
        script: 'node appCache.js',
        interval: 30000,
      },
    ],
    input: [
      {
        id: 2,
        type: 'RootScript',
        respondsTo: (input) => {
          return input.match(/^\w+$/)
        },
        script: 'node appFinder.js "{query}"',
        connections: ['open'],
      },
      {
        id: 3,
        type: 'PrefixScript',
        prefix: 'find',
        space: true,
        args: 'Required',
        script: 'node fileFinder.js "{query}"',
        connections: ['find'],
      },
      {
        id: 4,
        type: 'PrefixScript',
        prefix: 'open',
        space: true,
        args: 'Required',
        script: 'node fileFinder.js "{query}"',
        connections: ['open'],
      },
    ],
    output: [
      {
        id: 'open',
        type: 'OpenFile',
      },
      {
        id: 'find',
        type: 'ShowFile',
      },
    ],
  },
}
