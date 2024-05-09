import path from 'path'

export default {
	output: {
		path: path.resolve(import.meta.dirname, 'public'),
		publicPath: '',
	},
	devServer: {
		static: {
			directory: path.join(import.meta.dirname, 'public'),
		},
	},
}
