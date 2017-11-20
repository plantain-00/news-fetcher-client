const { checkGitStatus, executeScriptAsync } = require('clean-scripts')
const { watch } = require('watch-then-execute')

const tsFiles = `"*.ts" "static/**/*.tsx" "spec/**/*.ts" "static_spec/**/*.ts"`
const jsFiles = `"*.config.js" "static/**/*.config.js" "static_spec/**/*.config.js"`

const tscCommand = `tsc`
const tscStaticCommand = `tsc -p static`
const webpackCommand = `webpack --display-modules --config static/webpack.config.js`
const cssCommand = [
  `postcss static/index.css -o static/index.postcss.css`,
  `cleancss -o static/index.bundle.css static/index.postcss.css`
]

module.exports = {
  build: {
    back: tscCommand,
    js: [
      tscStaticCommand,
      webpackCommand
    ],
    css: cssCommand,
    copy: [
      `rimraf static/css static/fonts`,
      `cpy ./node_modules/bootstrap/dist/css/bootstrap.min.css static/css/`,
      `cpy ./node_modules/bootstrap/fonts/*.* ./static/fonts`,
      `cpy ./node_modules/highlight.js/styles/github.css static/css`
    ]
  },
  lint: {
    ts: `tslint ${tsFiles}`,
    js: `standard ${jsFiles}`,
    export: `no-unused-export ${tsFiles}`
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
    consistency: () => checkGitStatus()
  },
  fix: {
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`
  },
  release: [
    `rimraf dist`,
    `clean-release`
  ],
  watch: {
    back: `${tscCommand} --watch`,
    front: `${tscStaticCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    css: () => watch(['scripts/*.css'], [], () => executeScriptAsync(cssCommand))
  }
}
