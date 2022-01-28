const path = require('path')

module.exports = {
	output: {
		path: path.resolve(__dirname, 'docs'),
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'docs'),
		},
	},
}
