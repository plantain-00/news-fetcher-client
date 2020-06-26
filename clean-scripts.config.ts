import { executeScriptAsync } from 'clean-scripts'
import { watch } from 'watch-then-execute'

const tsFiles = `"*.ts" "static/**/*.tsx"`

const tscCommand = `tsc`
const webpackCommand = `webpack --config static/webpack.config.ts`
const cssCommand = [
  `postcss static/index.css -o static/index.postcss.css`,
  `cleancss -o static/index.bundle.css static/index.postcss.css`
]

export default {
  build: {
    back: tscCommand,
    js: [
      webpackCommand
    ],
    css: cssCommand,
    copy: [
      `rimraf static/css static/fonts`,
      `cpy ./node_modules/bootstrap/dist/css/bootstrap.min.css static/css/`,
      `cpy ./node_modules/highlight.js/styles/github.css static/css`
    ]
  },
  lint: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles}`,
    export: `no-unused-export ${tsFiles}`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p . --strict',
    typeCoverageStatic: 'type-coverage -p static --strict'
  },
  test: {},
  fix: `eslint --ext .js,.ts,.tsx ${tsFiles} --fix`,
  watch: {
    back: `${tscCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    css: () => watch(['scripts/*.css'], [], () => executeScriptAsync(cssCommand))
  }
}
