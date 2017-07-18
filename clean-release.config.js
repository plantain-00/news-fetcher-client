const { version } = require('./package.json')

module.exports = {
  include: [
    'libs.js',
    'main.js',
    'config.js',
    'schema.json',
    'static/index.bundle.js',
    'static/index.bundle.css',
    'static/css/*',
    'static/fonts/*',
    'static/index.html',
    'LICENSE',
    'package.json',
    'README.md'
  ],
  exclude: [
  ],
  postScript: [
    'cd [dir] && npm i --production',
    `electron-packager [dir] "news-fetcher-client" --out=dist --arch=x64 --version=${version} --app-version="${version}" --platform=darwin --ignore="dist/"`,
    `electron-packager [dir] "news-fetcher-client" --out=dist --arch=x64 --version=${version} --app-version="${version}" --platform=win32 --ignore="dist/"`,
    `7z a -r -tzip dist/news-fetcher-client-darwin-x64-${version}.zip dist/news-fetcher-client-darwin-x64/`,
    `7z a -r -tzip dist/news-fetcher-client-win32-x64-${version}.zip dist/news-fetcher-client-win32-x64/`,
    'electron-installer-windows --src dist/news-fetcher-client-win32-x64/ --dest dist/',
    'cd dist && create-dmg news-fetcher-client-darwin-x64/news-fetcher-client.app'
  ]
}
