const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");


module.exports = {
  mode: 'production',
  entry: './src/index.js',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "public/css", to: "css" },
      ],
    }),
    new HtmlWebpackPlugin({
      title: 'Portuguese Exercises',
      template: 'public/index.html.ejs'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ya?ml$/,
        use: 'yaml-loader'
      }
    ]
  },
};
