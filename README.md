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

# package

## osx

- gulp pack-osx

## windows

- gulp pack-win

# secure: create a file of `secret.ts`, like:

```typescript
import * as settings from "./settings";

export function load() {
    settings.key = "";
}
```
