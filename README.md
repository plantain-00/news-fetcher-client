[![Dependency Status](https://david-dm.org/plantain-00/news-fetcher-client.svg)](https://david-dm.org/plantain-00/news-fetcher-client)
[![devDependency Status](https://david-dm.org/plantain-00/news-fetcher-client/dev-status.svg)](https://david-dm.org/plantain-00/news-fetcher-client#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/news-fetcher-client.svg?branch=master)](https://travis-ci.org/plantain-00/news-fetcher-client)

# tools and global npm packages

- node v4+
- electron-prebuilt
- typescript
- gulp
- electron-packager

# develop

- npm install
- tsc && gulp tslint
- electron .

# pack

## osx

- gulp pack-osx

## windows

- gulp pack-win

# usage

### it is available for windows and mac OSX, looks like:
![](./sample.png)

if you want to sync history between different PC, you may want the server-side part: https://github.com/plantain-00/news-fetcher , and add a `secret.ts` file to keep the communication safe. And add environment variable `NEWS_FETCHER_KEY` and `NEWS_FETCHER_SERVER_URL`.

### develop

1. pull the source code
2. install tools and global npm packages
3. run `npm install && tsc`
4. pack it for your current OS

### news sources

There are some news sources already(check `sources` in `settings.ts` file), and you can add more sources or remove the default sources, then rebuild and repack the program.
