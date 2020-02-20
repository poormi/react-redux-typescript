"use strict"

const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin')

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const os = require('os');
const HappyPack = require('happypack');

const happyThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length
});

const {
    getDllManifest
} = require('./webpack.base.config')

const PATHS = {
    build: path.join(__dirname, '../dist'),
    src: path.join(__dirname, '../src'),
    static: path.join(__dirname, '../static'),
    style: path.join(__dirname, '../src/assets/css'),
    modules: path.join(__dirname, '..', 'modules')
};
module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        index: PATHS.src,
        //vendor: ['react', 'redux', 'react-redux', 'react-dom'],
        style: path.join(PATHS.style, 'common.css')
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.json', '.scss', '.jsx', '.svg'],
        alias: {
            js: path.join(PATHS.src, 'assets/js'),
            css: PATHS.style,
            images: path.join(PATHS.src, 'assets/images'),
            Actions: path.join(PATHS.src, 'redux/actions'),
            utils: path.join(PATHS.src, 'utils')
        }
    },
    output: {
        path: PATHS.build,
        filename: 'js/[name].[chunkhash].js',
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: 4,
                sourceMap: false // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ],
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        },
    },
    plugins: [
        ...getDllManifest,
        new HtmlWebpackPlugin({
            template: path.join(PATHS.src, 'temp/index.template.html'),
            inject: true,
            title: 'react-redux-typescript',
            tingyun: 'https://res.com/js/test.js',
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].css",
            chunkFilename: "css/[id].css"
        }),
        new CleanWebpackPlugin([PATHS.build], {
            root: process.cwd()
        }),
        new webpack.HashedModuleIdsPlugin(),
        new CopyWebpackPlugin([{
            from: path.resolve(PATHS.src, 'assets'),
            to: PATHS.build,
            ignore: ['css/*.*']
        }]),
        new CopyWebpackPlugin([{
            from: PATHS.static,
            to: PATHS.build,
            ignore: ['.*', 'manifest/*']
        }]),
        new HtmlWebpackIncludeAssetsPlugin({
            append: false,
            publicPath: '',
            assets: [{
                path: 'lib',
                glob: '**/*.js',
                globPath: path.resolve(PATHS.static, 'lib'),
            }],
        }),
        new HappyPack({
            id: 'ts',
            threadPool: happyThreadPool,
            loaders: ['babel-loader?cacheDirectory=true']
        }),
    ],
    module: {
        rules: [{
            test: /\.(ts|tsx)?$/,
            use: 'happypack/loader?id=ts',
            exclude: /node_modules/
        }, {
            test: /\.(png|jpg|gif|ttf|woff|woff2|eot)$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: 'images/[name].[ext]?[hash]'
            }
        }, {
            test: /\.(sa|sc|c)ss$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader']
        }, {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            use: [{
                loader: 'babel-loader',
            }, {
                loader: '@svgr/webpack',
                options: {
                    babel: false,
                    icon: true,
                }
            }]
        }]
    }
}