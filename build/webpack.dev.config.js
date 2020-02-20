const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
  style: path.join(__dirname, '../src/assets/css')
};

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    index: ['react-hot-loader/patch', PATHS.src], // activate HMR for React    
    style: path.join(PATHS.style, 'common.css')
  },
  output: {
    path: PATHS.build,
    filename: 'js/[name].[hash].js',
    // necessary for HMR to know where to load the hot update chunks
    publicPath: '/'
  },
  plugins: [
    // ...getDllManifest,
    new HtmlWebpackPlugin({
      template: 'src/temp/index.template.html',
      favicon: 'favicon.ico',
      title: 'react-redux-typescript',
      chunksSortMode: 'none',
      inject: true
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
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
      loaders: ['babel-loader?cacheDirectory=true'],
    }),
    new HappyPack({
      id: 'svg',
      threadPool: happyThreadPool,
      loaders: [{
        loader: 'babel-loader',
      }, {
        loader: '@svgr/webpack',
        options: {
          babel: false,
          icon: true,
        }
      }]
    })
  ],
  devServer: {
    historyApiFallback: true,
    inline: true,
    host: 'dev.com',
    hot: true,
    port: 3000,
    compress: true,
    disableHostCheck: true, //LAN host config
    stats: 'errors-only',
    proxy: {
      '/mock': {
        target: 'http://mock.com/api/',
        pathRewrite: {
          '^/mock': '/web'
        },
        changeOrigin: true,
        secure: false
      }
    }
  },
  devtool: 'cheap-module-eval-source-map', //eval-source-map
  module: {
    rules: [{
      test: /\.(ts|tsx)$/,
      //   use:  [ 'babel-loader?cacheDirectory=true' ],
      use: 'happypack/loader?id=ts',
      exclude: /node_modules/
    }, {
      test: /\.(png|jpg|gif|ttf|woff|woff2|eot)$/,
      use: 'url-loader?limit=8192'
    }, {
      test: /\.(sa|sc|c)ss$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      use: 'happypack/loader?id=svg',
      //   use: [{
      //     loader: 'babel-loader',
      //   },{
      //     loader: '@svgr/webpack',
      //     options: {
      //       babel: false,
      //       icon: true,
      //     }
      //   }]
    }]
  },
  resolve: {
    extensions: ['.js', '.json', '.scss', '.jsx', '.ts', '.tsx', '.svg'],
    alias: {
      js: path.join(PATHS.src, 'assets/js'),
      css: PATHS.style,
      images: path.join(PATHS.src, 'assets/images'),
      Actions: path.join(PATHS.src, 'redux/actions'),
      utils: path.join(PATHS.src, 'utils')
    }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        },
        commons: {
          name: "commons",
          chunks: "all",
          minChunks: 2
        }
      }
    },
    runtimeChunk: true
  }
};