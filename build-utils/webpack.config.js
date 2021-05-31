const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const paths = {
	src: path.resolve(__dirname, '..', './src'),
	dist: path.resolve(__dirname, '..', './dist'),
	data: path.resolve(__dirname, '..', './data')
}

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
	context: paths.src,
  entry: './deventry',
  output: {
    path: paths.dist,
    filename: 'bundle.js',
    clean: true,
  },
  plugins: [
  	new HtmlWebpackPlugin({
  		title: 'App Development',
  	}),
  	new CopyWebpackPlugin({
  		patterns: [
        { 
	        from: paths.data,
	        to: paths.dist + '/data/' // 2 forward slashes are important        	
        },
      ],
  	})
  ],
  devServer: {
  	contentBase: paths.dist,
		port: 8001,
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