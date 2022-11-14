const webpackMerge = require('webpack-merge');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const { ROOT_PATH } = require('./utils/index');
const { prod } = require('./utils/loaders');
const template = path.resolve(ROOT_PATH, './public/index.html');
const entry = path.resolve(ROOT_PATH, '.src/index.tsx');
const baseConfig = require('agora-classroom-sdk/webpack/webpack.base');

const config = {
  mode: 'production',
  entry: entry,
  output: {
    path: path.resolve(ROOT_PATH, './build'),
    publicPath: './',
    filename: 'static/bundle-[contenthash].js',
    clean: true,
  },
  module: {
    rules: [...prod],
  },
  resolve: {
    alias: {
      '@classroom': path.resolve(ROOT_PATH, '../agora-classroom-sdk/src/'),
      '@proctor': path.resolve(ROOT_PATH, '../agora-proctor-sdk/src/'),
      '@app': path.resolve(ROOT_PATH, 'src'),
      '@app/ui-kit': path.resolve(ROOT_PATH, 'src/ui-kit'),
      '~app-components': path.resolve(ROOT_PATH, 'src/ui-kit/components'),
      '~app-styles': path.resolve(ROOT_PATH, 'src/ui-kit/styles'),
      '~app-utilities': path.resolve(ROOT_PATH, 'src/ui-kit/utilities'),
      '~widget-ui-kit': path.resolve(ROOT_PATH, '../agora-plugin-gallery/src/ui-kit'),
      '~widget-components': path.resolve(
        ROOT_PATH,
        '../agora-plugin-gallery/src/ui-kit/components',
      ),
      '~widget-utilities': path.resolve(ROOT_PATH, '../agora-plugin-gallery/src/ui-kit/utilities'),
      ...ALIAS,
    },
  },
  optimization: {
    minimize: true,
    nodeEnv: 'production',
    minimizer: [
      new TerserPlugin({
        // parallel: require('os').cpus().length, // 多线程并行构建
        parallel: false,
        extractComments: false,
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
          compress: {
            warnings: false, // 删除无用代码时是否给出警告
            drop_debugger: true, // 删除所有的debugger
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new dotenv({
      path: path.resolve(ROOT_PATH, '../../.env'),
    }),
    new MiniCssExtractPlugin({
      filename: 'static/[name].[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: template,
      inject: true,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(ROOT_PATH, './public'),
          to: path.resolve(ROOT_PATH, './build'),
          globOptions: {
            ignore: ['**/index.html'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify('production'),
    }),
    // new BundleAnalyzerPlugin(),
  ],
};

const mergedConfig = webpackMerge.merge(baseConfig, config);
module.exports = mergedConfig;
