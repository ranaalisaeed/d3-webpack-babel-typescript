const path = require('path')

const paths = {
	src: path.resolve(__dirname, '..', './src'),
	dist: path.resolve(__dirname, '..', './dist'),
}

module.exports = {
  mode: 'production',
  devtool: 'source-map',
	context: paths.src,
  entry: {
		vizCharts: './prodentry',
	},
  output: {
    path: paths.dist,
    filename: '[name].min.js',
    clean: true,
		library: {
			name: 'vizChartLibrary',
			type: 'umd',
		},
  },
	externals: {
		commonjs: 'd3',
		amd: 'd3',
		root: 'd3'
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