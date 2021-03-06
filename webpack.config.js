const path = require('path');

module.exports = {
  mode: "production",
  entry: {
    background: './src/Background/index.ts',
    popup: './src/Popup/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      { 
        test: /\.html$/,
        loader: 'html-loader' 
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    path: path.resolve(__dirname, 'plugin/assets/js'),
    filename: '[name].js',
  },
};