[![Dependency Status](https://david-dm.org/plantain-00/news-fetcher-client.svg)](https://david-dm.org/plantain-00/news-fetcher-client)
[![devDependency Status](https://david-dm.org/plantain-00/news-fetcher-client/dev-status.svg)](https://david-dm.org/plantain-00/news-fetcher-client#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/news-fetcher-client.svg?branch=master)](https://travis-ci.org/plantain-00/news-fetcher-client)

# develop

- `npm i`
- `npm run build`
- `npm run tslint`
- `npm run start`

# usage

### it is available for windows and mac OSX, looks like:
![](./sample.png)

if you want to sync history between different PC, you may want the server-side part: https://github.com/plantain-00/news-fetcher , and set your key and server url at `configuration.json` in your `userData` path.

### MEMO

When update a version, 3 places should be updated:
+ version in package.json
+ osx and win in scripts in package.json
+ title in index.html
