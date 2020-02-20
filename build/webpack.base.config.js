const webpack = require('webpack')
const path = require('path')
const PATHS = {
    build: path.join(__dirname, '../dist'),
    src: path.join(__dirname, '../src'),
    static: path.join(__dirname, '../static'),
    style: path.join(__dirname, '../src/assets/css')
};
const dllEntry = {
    'react': ['react', 'redux', 'react-svg', 'react-dom', 'react-router', 'react-redux'],
    'styledComponents': ['styled-components'],
    /*'lodash':['lodash'],
    'moment':['moment'],*/
}
const getDllManifest = () => {
    var plugins = []
    Object.keys(dllEntry).forEach((name) => {
        plugins.push(
            new webpack.DllReferencePlugin({
                manifest: path.resolve(PATHS.static, 'manifest/[name].manifest.json').replace(/\[name\]/gi, name)
            })
        )
    })
    return plugins
}
module.exports = {
    dllEntry,
    getDllManifest: getDllManifest()
}