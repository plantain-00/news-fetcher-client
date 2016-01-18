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
