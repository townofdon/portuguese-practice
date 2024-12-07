const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

function stripTrailingSlash(text) {
  return String(text).replace(/\/$/, '')
}

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: './src/index.js',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/portuguese-practice'),
    publicPath: stripTrailingSlash(isProduction ? '/' : '/portuguese-practice'),
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

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
}
