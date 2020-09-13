const { join } = require("path");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: join(__dirname, "src/background.ts"),
    popup: join(__dirname, "src/popup.ts"),
    novel_updates: join(__dirname, "src/novel_updates.ts"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: join(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'assets'},
        { from: 'node_modules/jszip/dist/jszip.min.js'},
        { from: 'node_modules/ejs/ejs.min.js'},
        { from: 'node_modules/file-saver/dist/FileSaver.min.js'},
        { from: 'node_modules/file-saver/dist/FileSaver.min.js.map'}
      ],
    }),
  ],
};
