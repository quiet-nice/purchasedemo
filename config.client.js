const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const WebpackSftpClient = require('webpack-sftp-client')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const baseConfig = require('./webpack.config.base')
// Vue Loader v15 现在需要配合一个 webpack 插件才能正确使用
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'

const publicPath = {
  dev: '/enterprise-loan/',
  pro: '/enterprise-loan/'
}

const defaultPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: isDev ? '"development"' : '"production"'
    }
  }),
  new HTMLPlugin({
    template: path.join(__dirname, 'template.html')
  }),
  new VueLoaderPlugin()
]

const devServer = {
  disableHostCheck: true, // 跳过host检查，可以使用别的域名解析到devServer进行访问
  clientLogLevel: 'warning',
  port: 8083,
  // host: '100.119.134.64',
  host: 'localhost',
  publicPath: publicPath.dev,
  hot: true,
  overlay: {
    warnings: false,
    errors: true
  },
  // 打开调试时的跨域
  headers: { 'Access-Control-Allow-Origin': '*' },
  historyApiFallback: true,
  proxy: {
    '/syf-msfs-front/*': {
      // 开启https支持
      secure: false,
      target: 'http://10.118.214.165/' // 测试环境(信贷核心)
      // target: 'http://100.119.132.236:8099/' // 彭冲
      // target: 'http://100.119.129.136:8099/' // 贾帅龙
    }
  }
}

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

let config

if (isDev) {
  config = merge(baseConfig, {
    mode: 'development',
    devtool: '#cheap-module-eval-source-map',
    output: {
      publicPath: publicPath.dev
    },
    module: {
      rules: [
        {
          test: /\.scss|\.css$/,
          use: [
            'vue-style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: false,
                localIdentName: '[local]_[hash:base64:8]'
              }
            },
            postCssLoader,
            px2remLoader,
            'sass-loader',
            sassResourcesLoader
          ]
        }
      ]
    },
    devServer,
    plugins: defaultPlugins.concat([
      new webpack.HotModuleReplacementPlugin()
    ])
  })
} else {
  config = merge(baseConfig, {
    mode: 'production',
    entry: {
      app: path.join(__dirname, '../client/client-entry.js'),
      vendor: ['vue']
    },
    output: {
      filename: 'static/[name].[chunkhash:8].js',
      path: path.join(__dirname, '../dist/pro'),
      publicPath: publicPath.pro
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
      new MiniCssExtractPlugin({
        filename: 'static/styles.[contentHash:8].css'
      }),
      new CleanWebpackPlugin()
    ]),
    optimization: {
      minimizer: [
        new TerserJSPlugin({
          terserOptions: {
            compress: {
              warnings: false,
              drop_debugger: true,
              drop_console: true
            }
          }
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  })
}

config.resolve = {
  alias: {
    'model': path.join(__dirname, '../client/models/client-models.js')
  }
}

module.exports = config
