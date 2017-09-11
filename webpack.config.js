const webpack = require('webpack'); 
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');//минифицирует файл js

const config = {
  output: {
    filename: 'bundle.js'//то как мы хотим назвать наш итоговый файл js
  },
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true//добавить сорсмап
    })
  ]
};

module.exports = config;