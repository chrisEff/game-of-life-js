module.exports = {
	extends: ['standard', 'plugin:prettier/recommended'],
	parser: '@babel/eslint-parser',
	env: {
		browser: true,
		mocha: true,
	},
	plugins: ['prettier', 'unicorn'],
	rules: {
		'prettier/prettier': 'error',
		'unicorn/no-lonely-if': 'error',
		'unicorn/no-nested-ternary': 'error',
		'unicorn/no-new-array': 'error',
		'unicorn/no-unused-properties': 'error',
		'unicorn/no-useless-length-check': 'error',
		'unicorn/prefer-array-some': 'error',
		'unicorn/prefer-includes': 'error',
		'unicorn/prefer-module': 'error',
		'unicorn/prefer-number-properties': 'error',
		'unicorn/prefer-query-selector': 'error',
		'unicorn/prefer-switch': 'error',
		'unicorn/prefer-ternary': 'error',
	},
}
