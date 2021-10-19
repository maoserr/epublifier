const {join} = require("path");
const {VueLoaderPlugin} = require("vue-loader");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require("webpack");

module.exports = {
    entry: {
        popup: join(__dirname, "src/entry/popup/popup.ts"),
        main: join(__dirname, "src/entry/main/main.ts"),
        getPageSource: join(__dirname, "src/entry/getPageSource.ts"),
        sandbox: join(__dirname, "src/entry/sandbox.ts"),
        options: join(__dirname, "src/entry/options/options.ts"),
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
                options: {appendTsSuffixTo: [/\.vue$/]}
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
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
        extensions: [".tsx", ".ts", ".js", '.vue', '.json'],
        alias: {
            'vue': '@vue/runtime-dom'
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
        new HtmlWebpackPlugin({
            chunks: ['sandbox'],
            filename: 'sandbox.html',
            template: 'templates/sandbox.html'
        }),
        new HtmlWebpackPlugin({
            chunks: ['options'],
            filename: 'options.html',
            template: 'templates/options.html'
        }),
        new CopyPlugin({
            patterns: [
                {from: "assets"},
                {from: "node_modules/jszip/dist/jszip.min.js", to: "js/vender"},
                {from: "node_modules/ejs/ejs.min.js", to: "js/vender"},
            ],
        }),
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: JSON.stringify(true),
            __VUE_PROD_DEVTOOLS__: JSON.stringify(true),
        })
    ],
};
