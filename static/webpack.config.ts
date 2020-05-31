import * as webpack from 'webpack'

export default {
  entry: {
    index: './static/index'
  },
  output: {
    path: __dirname,
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
} as webpack.Configuration
