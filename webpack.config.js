const {join} = require("path");
const {VueLoaderPlugin} = require("vue-loader");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require("webpack");
const pack = require('./package.json');
const TerserPlugin = require("terser-webpack-plugin");

function modify_manifest(buffer, browser_type, version, mode) {
    // copy-webpack-plugin passes a buffer
    let manifest = JSON.parse(buffer.toString());
    let icons = {
        16: "images/icon16.png",
        32: "images/icon32.png",
        48: "images/icon48.png",
        128: "images/icon128.png"
    }
    manifest.author = pack.author
    manifest.description = pack.description
    manifest.icons = icons

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
            default_icon: icons,
            default_title: manifest.name,
            default_popup: "popup.html"
        }
        manifest.options_ui.open_in_tab = true
        manifest.content_security_policy = "script-src 'self'; object-src 'self';";
    } else {
        // Chrome specific
        manifest.manifest_version = 3
        manifest.permissions.push("scripting")
        manifest.host_permissions = ["<all_urls>"]
        manifest.sandbox = {"pages": ["sandbox.html"]};
        manifest.action = {
            default_icon: icons,
            default_title: manifest.name,
            default_popup: "popup.html"
        }
    }
    // Dynamic version
    manifest.version = version;

    // pretty print to JSON with two spaces
    return JSON.stringify(manifest, null, 2);
}

module.exports = (env, argv) => {
    let out_dir = "dist/chrome"
    let ver = "1.0.0"
    if (env.version) {
        ver = env.version
    }
    if (env.browser_type === "firefox") {
        out_dir = "dist/firefox"
    }
    if (argv.mode === "production") {
        out_dir = out_dir + "_prod"
    }
    return {
        optimization: {
            minimize: argv.mode === "production",
            // EJS uses new Function
            minimizer: [new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true,
                    mangle: false
                }
            })],
        },
        entry: {
            popup: join(__dirname, "src/entry/popup/popup.ts"),
            main: join(__dirname, "src/entry/main/main.ts"),
            getPageSource: join(__dirname, "src/entry/getPageSource.ts"),
            sandbox: join(__dirname, "src/entry/sandbox.ts"),
            options: join(__dirname, "src/entry/options/options.ts"),
        },
        devtool: 'cheap-module-source-map',
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
                },
                {
                    test: /\.(ejs|xml)$/i,
                    type: 'asset/source'
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
            fallback: {
                "fs": false,
                "buffer": require.resolve("buffer"),
                "path": require.resolve("path-browserify")
            }
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
                    {
                        from: "src/manifest.json",
                        to: "manifest.json",
                        transform(content, path) {
                            return modify_manifest(content, env.browser_type, ver, argv.mode)
                        }
                    }
                ],
            }),
            new webpack.DefinePlugin({
                __VUE_OPTIONS_API__: "true",
                __VUE_PROD_DEVTOOLS__: "false",
            }),
            new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
                const mod = resource.request.replace(/^node:/, "");
                switch (mod) {
                    case "buffer":
                        resource.request = "buffer";
                        break;
                    case "stream":
                        resource.request = "readable-stream";
                        break;
                    default:
                        throw new Error(`Not found ${mod}`);
                }
            })
        ],
    }
}
