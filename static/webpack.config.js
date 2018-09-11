const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  entry: {
    index: './static/index'
  },
  output: {
    path: __dirname,
    filename: '[name].bundle.js'
  },
  resolve: isDev ? {
    extensions: ['.ts', '.tsx', '.js']
  } : undefined,
  module: isDev ? {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  } : undefined
}
