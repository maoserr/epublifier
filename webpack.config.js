const {join} = require("path");
const {VueLoaderPlugin} = require("vue-loader");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require("webpack");
const pack = require('./package.json');

function modify_manifest(buffer, browser_type, mode) {
    // copy-webpack-plugin passes a buffer
    let manifest = JSON.parse(buffer.toString());

    if (browser_type === "firefox") {
        // Firefox specific
        manifest.browser_specific_settings = {
            "gecko": {
                "id": "epublifier@maoserr.com",
                "strict_min_version": "42.0"
            }
        }
        manifest.content_security_policy = "script-src 'self' 'unsafe-eval'; object-src 'self';";
    } else {
        // Chrome specific
        manifest.sandbox = {"pages": ["sandbox.html"]};
        if (mode === "development") {
            manifest.background = {
                "scripts": ["js/vender/hot-reload.js"],
                "persistent": false
            }
        }
    }
    // Dynamic version
    manifest.version = pack.version;

    // pretty print to JSON with two spaces
    return JSON.stringify(manifest, null, 2);
}

module.exports = (env,argv) => {
    return {
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
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                    },
                    exclude: /node_modules/,
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
                    {
                        from: "src/manifest.json",
                        to: "manifest.json",
                        transform(content, path) {
                            return modify_manifest(content, env.browser_type, argv.mode)
                        }
                    }
                ],
            }),
            new webpack.DefinePlugin({
                __VUE_OPTIONS_API__: JSON.stringify(true),
                __VUE_PROD_DEVTOOLS__: JSON.stringify(true),
            })
        ],
    }
}