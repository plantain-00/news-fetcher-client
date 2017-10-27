const { execAsync } = require('clean-scripts')

const tsFiles = `"*.ts" "static/**/*.tsx" "spec/**/*.ts" "static_spec/**/*.ts"`
const jsFiles = `"*.config.js" "static/**/*.config.js" "static_spec/**/*.config.js"`

module.exports = {
  build: {
    back: `tsc`,
    js: [
      `tsc -p static`,
      `webpack --display-modules --config static/webpack.config.js`
    ],
    css: [
      `postcss static/index.css -o static/index.postcss.css`,
      `cleancss -o static/index.bundle.css static/index.postcss.css`
    ],
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
    consistency: async () => {
      const { stdout } = await execAsync('git status -s')
      if (stdout) {
        console.log(stdout)
        throw new Error(`generated files doesn't match.`)
      }
    }
  },
  fix: {
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`
  },
  release: [
    `rimraf dist`,
    `clean-release`
  ],
  watch: `watch-then-execute "scripts/*.tsx" "*.ts" "scripts/*.css" --script "npm run build"`
}
