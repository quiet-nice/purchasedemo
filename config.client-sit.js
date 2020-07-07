/**
 * sit 打包配置
 */
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackSftpClient = require('webpack-sftp-client')
const baseConfig = require('./webpack.config.base')
// Vue Loader v15 现在需要配合一个 webpack 插件才能正确使用
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const publicPath = '/enterprise-loan/'

const defaultPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"development"'
    }
  }),
  new HTMLPlugin({
    template: path.join(__dirname, 'template.html')
  }),
  new VueLoaderPlugin()
]

const postCssLoader = {
  loader: 'postcss-loader',
  options: {
    sourceMap: true
  }
}

const px2remLoader = {
  loader: 'px2rem-loader',
  options: {
    remUnit: 75
  }
}

const sassResourcesLoader = {
  loader: 'sass-resources-loader',
  options: {
    resources: path.resolve(__dirname, '../ued-ui/assets/styles/variable.scss')
  }
}

let config = merge(baseConfig, {
  mode: 'development',
  entry: {
    app: path.join(__dirname, '../client/client-entry.js'),
    vendor: ['vue']
  },
  output: {
    filename: 'static/[name].[chunkhash:8].js',
    path: path.join(__dirname, '../dist/sit'),
    publicPath: publicPath
  },
  module: {
    rules: [
      {
        test: /\.scss|\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          postCssLoader,
          px2remLoader,
          'sass-loader',
          sassResourcesLoader
        ]
      }
    ]
  },
  plugins: defaultPlugins.concat([
    // new WebpackSftpClient({
    //   port: '20020',
    //   host: '10.118.236.56',
    //   username: 'nginx',
    //   password: 'nginx@236.56',
    //   path: './dist/sit',
    //   verbose: true,
    //   remotePath: '/usr/local/nginx/static/enterprise-loan'
    // }),
    // new WebpackSftpClient({
    //   port: '20020',
    //   host: '10.118.236.218',
    //   username: 'nginx',
    //   password: 'nginx@123',
    //   path: './dist/sit',
    //   verbose: true,
    //   remotePath: '/usr/local/nginx/static/enterprise-loan'
    // }),
    // new WebpackSftpClient({
    //   port: '22',
    //   host: '10.118.214.165',
    //   username: 'root',
    //   password: 'SFpay!@#456',
    //   path: './dist/sit',
    //   verbose: true,
    //   remotePath: '/usr/local/nginx/static/enterprise-loan'
    // }),
    new WebpackSftpClient({
      port: '22',
      host: '10.206.240.50',
      username: 'nginx',
      password: 'nginx#ccs',
      path: './dist/sit',
      verbose: true,
      remotePath: '/usr/local/nginx/html'
    }),
    new MiniCssExtractPlugin({
      filename: 'static/styles.[contentHash:8].css'
    }),
    new CleanWebpackPlugin()

  ])
})

config.resolve = {
  alias: {
    'model': path.join(__dirname, '../client/models/client-models.js')
  }
}

module.exports = config
