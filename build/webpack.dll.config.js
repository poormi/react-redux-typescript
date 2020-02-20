const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const {dllEntry:entry}=require('./webpack.base.config')
const PATHS = {
    static: path.join(__dirname, '../static'),
};
module.exports = {
    mode:'production',
    entry,
    output: {
        path: path.join(__dirname, '..','static/lib'),
        filename: '[name]-[chunkhash:7].dll.js',
        library: 'lib_[name]',
    },
    plugins: [
        new CleanWebpackPlugin([PATHS.static], {
            root: process.cwd()
        }),
        new webpack.DllPlugin({
            path: path.resolve(__dirname,'..','static/manifest/[name].manifest.json'),
            name: 'lib_[name]'
        }),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.NamedChunksPlugin()
    ]
}