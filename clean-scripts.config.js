module.exports = {
  build: {
    back: `tsc`,
    js: [
      `tsc -p static`,
      `webpack --display-modules --config static/webpack.config.js`
    ],
    css: `cleancss -o static/index.bundle.css static/index.css`,
    copy: [
      `rimraf static/css static/fonts`,
      `cpy ./node_modules/bootstrap/dist/css/bootstrap.min.css static/css/`,
      `cpy ./node_modules/bootstrap/fonts/*.* ./static/fonts`,
      `cpy ./node_modules/highlight.js/styles/github.css static/css`
    ]
  },
  lint: {
    ts: `tslint "scripts/*.tsx" "*.ts"`,
    js: `standard "**/*.config.js"`
  },
  test: {
    jasmine: [
      'tsc -p spec',
      'jasmine'
    ],
    karma: [
      'tsc -p static_spec',
      'karma start static_spec/karma.config.js'
    ]
  },
  fix: {
    ts: `tslint --fix "scripts/*.tsx" "*.ts"`,
    js: `standard --fix "**/*.config.js"`
  },
  release: [
    `rimraf dist`,
    `clean-release`
  ]
}
