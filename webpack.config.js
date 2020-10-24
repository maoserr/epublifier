const { join } = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    popup: join(__dirname, "src/pages/popup/popup.ts"),
    main: join(__dirname, "src/pages/main/novel_updates.ts"),
    getPageSource: join(__dirname, "src/extension/getPageSource.ts"),
  },
  devtool: "source-map",
  devServer: {
    contentBase: "./dist",
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\.vue$/] },
        include: /src/,
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ],
  },
  output: {
    path: join(__dirname, "dist"),
    filename: "js/[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js",'.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['popup'],
      filename: 'popup.html',
      template: 'templates/popup.html'
    }),
    new HtmlWebpackPlugin({
      chunks: ['main'],
      filename: 'main.html',
      template: 'templates/main.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: "assets" },
        { from: "node_modules/jszip/dist/jszip.min.js", to: "js/vender" },
        { from: "node_modules/ejs/ejs.min.js", to: "js/vender" },
        { from: "node_modules/purecss/build/pure-min.css", to: "css/vender"}
      ],
    }),
  ],
};
