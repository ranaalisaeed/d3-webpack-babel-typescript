const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const paths = {
	srcdemo: path.resolve(__dirname, '..', './src/demos'),
	outdemo: path.resolve(__dirname, '..', './src/demos/build'),
}

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
	context: paths.srcdemo,
  entry: './stackbar',
  output: {
    path: paths.outdemo,
    filename: 'bundle.js',
    clean: true,
  },
  plugins: [
  	new HtmlWebpackPlugin({
  		title: 'App Demo',
  	}),
  ],
  devServer: {
		port: 8002,
		open: true,
  },
  module: {
  	rules: [
  		{
  			test: /\.(ts|js)x?$/,
  			use: ['babel-loader'],
				exclude: /node_modules/,
  		},
  	]
  },
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json']
	}
}