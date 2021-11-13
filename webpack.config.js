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
        manifest.manifest_version = 2
        manifest.browser_specific_settings = {
            "gecko": {
                "id": "epublifier@maoserr.com"
            }
        }
        manifest.permissions.push("<all_urls>")
        manifest.browser_action = {
            default_icon: {
                16: "images/icon16.png",
                32: "images/icon32.png",
                48: "images/icon48.png",
                128: "images/icon128.png"
            },
            default_title: "Epublifier",
            default_popup: "popup.html"
        }
        manifest.options_ui.open_in_tab = true
        manifest.content_security_policy = "script-src 'self' 'unsafe-eval'; object-src 'self';";
    } else {
        // Chrome specific
        manifest.manifest_version = 3
        manifest.host_permissions = ["<all_urls>"]
        manifest.sandbox = {"pages": ["sandbox.html"]};
        manifest.action = {
            default_icon: {
                16: "images/icon16.png",
                32: "images/icon32.png",
                48: "images/icon48.png",
                128: "images/icon128.png"
            },
            default_title: "Epublifier",
            default_popup: "popup.html"
        }
    }
    // Dynamic version
    manifest.version = pack.version;

    // pretty print to JSON with two spaces
    return JSON.stringify(manifest, null, 2);
}

module.exports = (env,argv) => {
    console.log(env)
    console.log(argv)
    let out_dir="dist"
    if (env.browser_type === "firefox") {
        out_dir = "dist_ff"
    }
    return {
        entry: {
            popup: join(__dirname, "src/entry/popup/popup.ts"),
            main: join(__dirname, "src/entry/main/main.ts"),
            getPageSource: join(__dirname, "src/entry/getPageSource.ts"),
            sandbox: join(__dirname, "src/entry/sandbox.ts"),
            options: join(__dirname, "src/entry/options/options.ts"),
        },
        devtool: "source-map",
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
            path: join(__dirname, out_dir),
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
                    {from: "node_modules/jepub/dist/jepub.min.js", to: "js/vender"},
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
                __VUE_OPTIONS_API__: "true",
                __VUE_PROD_DEVTOOLS__: "false",
            })
        ],
    }
}