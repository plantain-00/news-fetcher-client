# news-fetcher-client

[![Dependency Status](https://david-dm.org/plantain-00/news-fetcher-client.svg)](https://david-dm.org/plantain-00/news-fetcher-client)
[![devDependency Status](https://david-dm.org/plantain-00/news-fetcher-client/dev-status.svg)](https://david-dm.org/plantain-00/news-fetcher-client#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/news-fetcher-client.svg?branch=master)](https://travis-ci.org/plantain-00/news-fetcher-client)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/news-fetcher-client?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/news-fetcher-client/branch/master)
![Github CI](https://github.com/plantain-00/news-fetcher-client/workflows/Github%20CI/badge.svg)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Fnews-fetcher-client%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/news-fetcher-client)

## develop

- `npm i`
- `npm run build`
- `npm run tslint`
- `npm run start`

## usage

### it is available for windows and mac OSX, looks like

![sample](./sample.png)

if you want to sync history between different PC, you may want the server-side part: <https://github.com/plantain-00/news-fetcher> , and set your key and server url at `configuration.json` in your `userData` path.
