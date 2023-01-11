const path = require('path');

module.exports = {
  mode: 'development',
  // The entry point file described above
  entry: {
    index: './src/index.js',
  },
  // The location of the build folder described above
  devtool: 'eval-cheap-module-source-map', // 'eval-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  // Optional and for development only. This provides the ability to
  // map the built code back to the original source format when debugging.
  devtool: 'source-map',
  watch: true,
};