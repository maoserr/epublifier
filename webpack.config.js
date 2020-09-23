const { join } = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    background: join(__dirname, "src/extension/background.ts"),
    popup: join(__dirname, "src/extension/popup.ts"),
    novel_updates: join(__dirname, "src/pages/novel_updates.ts"),
    getPageSource: join(__dirname, "src/extension/getPageSource.ts"),
  },
  devtool: "source-map",
  devServer: {
    contentBase: "./dist",
  },
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
    filename: "js/[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "assets/manifest.json"},
        { from: "assets/html" },
        { from: "assets/images", to:"images"},
        { from: "assets/js", to: "js/vender" },
        { from: "node_modules/jszip/dist/jszip.min.js", to: "js/vender" },
        { from: "node_modules/ejs/ejs.min.js", to: "js/vender" },
      ],
    }),
  ],
};
