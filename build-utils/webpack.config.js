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
  entry: './index.js',
  output: {
    path: paths.dist,
    filename: 'bundle.js',
    clean: true,
  },
  plugins: [
  	new HtmlWebpackPlugin({
  		title: 'My App'
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
  },
  // module: {
  // 	rules: [
  // 		{
  // 			test: /\.(csv|tsv)$/i,
  // 			use: ['csv-loader'],
  // 		},
  // 	]
  // }
}