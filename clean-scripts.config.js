module.exports = {
  build: [
    `tsc`,
    `tsc -p static`,
    `rimraf static/index.bundle.* static/css static/fonts`,
    `cpy ./node_modules/bootstrap/dist/css/bootstrap.min.css static/css/`,
    `cpy ./node_modules/bootstrap/fonts/*.* ./static/fonts`,
    `cpy ./node_modules/highlight.js/styles/github.css static/css`,
    `cleancss -o static/index.bundle.css static/index.css`,
    `webpack --display-modules --config static/webpack.config.js`
  ],
  lint: [
    `tslint "scripts/*.tsx" "*.ts"`,
    `standard "**/*.config.js"`
  ],
  test: [
    'tsc -p spec',
    'jasmine',
    'tsc -p static_spec',
    'karma start static_spec/karma.config.js'
  ],
  fix: [
    `standard --fix "**/*.config.js"`
  ],
  release: [
    `rimraf dist`,
    `clean-release`
  ]
}
