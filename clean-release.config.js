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
    'electron-packager [dir] "news" --out=dist --arch=x64 --version=1.2.1 --app-version="1.0.8" --platform=darwin --ignore="dist/"',
    'electron-packager [dir] "news" --out=dist --arch=x64 --version=1.2.1 --app-version="1.0.8" --platform=win32 --ignore="dist/"',
    '7z a -r -tzip dist/news-darwin-x64.zip dist/news-darwin-x64/',
    '7z a -r -tzip dist/news-win32-x64.zip dist/news-win32-x64/'
  ]
}
