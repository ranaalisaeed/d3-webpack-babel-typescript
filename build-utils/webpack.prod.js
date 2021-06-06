const path = require('path')

const paths = {
	src: path.resolve(__dirname, '..', './src'),
	dist: path.resolve(__dirname, '..', './dist/bundle'),
}

module.exports = {
  mode: 'production',
  devtool: 'source-map',
	context: paths.src,
  entry: {
		'vizintel-charts': './index',
	},
  output: {
    path: paths.dist,
    filename: '[name].min.js',
    clean: true,
		library: {
			name: 'vizintel-charts',
			type: 'umd',
			umdNamedDefine: true,
		},
		globalObject: 'this',
  },
	// externals: {
	// 	commonjs: 'd3',
	// 	amd: 'd3',
	// 	root: 'd3'
	// },
	externals: [
		'd3-selection',
		'd3-scale',
		'd3-scale-chromatic',
		'd3-axis',
		'd3-shape',
		'd3-color',
		'd3-dispatch',
		'd3-array',
		'd3-transition',
	],
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
