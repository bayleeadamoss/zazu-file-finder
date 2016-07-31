# Zazu File Finder

[![Travis Build Status](https://travis-ci.org/tinytacoteam/zazu-file-finder.svg?branch=master)](https://travis-ci.org/tinytacoteam/zazu-file-finder)
[![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/b5t4tavohkhmqrer/branch/master?svg=true)](https://ci.appveyor.com/project/blainesch/zazu-file-finder)

Find files and applications on your computer easily.

## Commands

~~~
> find readme
> open readme
~~~

You can also find applications without a prefix by just typing in part of the
name:

~~~
> chrome
~~~

## Installing

Add `tinytacoteam/zazu-file-finder` inside of `plugins` block of your  `~/.zazurc.js` file.

~~~ javascript
module.exports = {
  'plugins': [
    'tinytacoteam/zazu-file-finder',
  ],
}
~~~
