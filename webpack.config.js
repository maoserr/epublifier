const { join } = require("path");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: join(__dirname, "src/background.js"),
    popup: join(__dirname, "src/popup.js"),
    novel_updates: join(__dirname, "src/novel_updates.js"),
  },
  output: {
    path: join(__dirname, "dist"),
    filename: "[name].js",
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
