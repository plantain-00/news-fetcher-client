[![Dependency Status](https://david-dm.org/plantain-00/news-fetcher-client.svg)](https://david-dm.org/plantain-00/news-fetcher-client)
[![devDependency Status](https://david-dm.org/plantain-00/news-fetcher-client/dev-status.svg)](https://david-dm.org/plantain-00/news-fetcher-client#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/news-fetcher-client.svg?branch=master)](https://travis-ci.org/plantain-00/news-fetcher-client)

# tools and global npm packages

- `npm run init`

# develop

- `npm run restore`
- `tsc`
- `npm run tslint`
- `electron .`

# usage

### it is available for windows and mac OSX, looks like:
![](./sample.png)

if you want to sync history between different PC, you may want the server-side part: https://github.com/plantain-00/news-fetcher , and set your key and server url at `configuration.json` in your `userData` path.

### news sources

There are some news sources already(check `sources` in `settings.ts` file), and you can add more sources or remove the default sources, then rebuild and repack the program.
