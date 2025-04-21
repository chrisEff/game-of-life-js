import globals from 'globals'
import pluginJs from '@eslint/js'

import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginUnicorn from 'eslint-plugin-unicorn'
import babelParser from '@babel/eslint-parser'

export default [
	pluginJs.configs.recommended,
	pluginPrettierRecommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.mocha,
			},
			parser: babelParser,
		},
		plugins: {
			unicorn: pluginUnicorn,
		},
		rules: {
			curly: 'error',
			'unicorn/no-lonely-if': 'error',
			'unicorn/no-array-for-each': 'error',
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
	},
	{
		ignores: ['.babelrc.cjs', '.yarn/', 'public/main.js'],
	},
]
