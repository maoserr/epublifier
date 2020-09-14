const { join } = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    background: join(__dirname, "src/background.ts"),
    popup: join(__dirname, "src/popup.ts"),
    novel_updates: join(__dirname, "src/novel_updates.ts"),
    getPageSource: join(__dirname, "src/getPageSource.ts"),
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        include: /src/,
      },
    ],
  },
  output: {
    path: join(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "assets" },
        { from: "node_modules/jszip/dist/jszip.min.js" },
        { from: "node_modules/ejs/ejs.min.js" },
      ],
    }),
  ],
};
