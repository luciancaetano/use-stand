/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';

const banner = fs.readFileSync(path.join(__dirname, 'LICENSE')).toString('utf-8');

module.exports = {
  entry: {
    index: './src/index.ts',
  },
  output: {
    filename: 'index.min.js',
    path: path.join(__dirname, 'dist'),
    library: {
      name: 'use-stand',
      type: 'umd',
    },
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React',
    },
  },
  devtool: 'source-map',
  plugins: [
    isProduction && new webpack.BannerPlugin({
      banner,
      entryOnly: false,
    }),
    isProduction && new CleanWebpackPlugin(),
  ].filter(Boolean),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  resolveLoader: {
    modules: ['node_modules'],
  },
  optimization: {
    minimize: isProduction,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-typescript', '@babel/react', ['@babel/env', { modules: false }]],
            plugins: [
              '@babel/plugin-transform-typescript',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
    ],
  },
};
