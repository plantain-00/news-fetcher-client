const childProcess = require('child_process')

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
    js: `standard "**/*.config.js"`,
    export: `no-unused-export "scripts/*.tsx" "*.ts"`
  },
  test: {
    jasmine: [
      'tsc -p spec',
      'jasmine'
    ],
    karma: [
      'tsc -p static_spec',
      'karma start static_spec/karma.config.js'
    ],
    consistency: () => new Promise((resolve, reject) => {
      childProcess.exec('git status -s', (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          if (stdout) {
            reject(new Error(`generated files doesn't match.`))
          } else {
            resolve()
          }
        }
      }).stdout.pipe(process.stdout)
    })
  },
  fix: {
    ts: `tslint --fix "scripts/*.tsx" "*.ts"`,
    js: `standard --fix "**/*.config.js"`
  },
  release: [
    `rimraf dist`,
    `clean-release`
  ],
  watch: `watch-then-execute "scripts/*.tsx" "*.ts" "scripts/*.css" --script "npm run build"`
}
