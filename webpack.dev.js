const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
      filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
              loader: 'css-loader',
              options: { sourceMap: true }
          }
        ],
      },
    ],
  },
  devServer: {
    static: {
        directory: path.resolve(__dirname, 'dist'),
    },
    open: true,
    port: 9000,
    hot: true,
    compress: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
    },
    watchFiles: ['src/**/*'],
  },
});