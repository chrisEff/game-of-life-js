const path = require('path')

module.exports = {
	output: {
		path: path.resolve(__dirname, 'public'),
		publicPath: '',
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
	},
}
