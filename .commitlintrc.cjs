module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'body-max-line-length': [0],
		'header-max-length': [2, 'always', 120],
	},
	prompt: {
		questions: {
			type: {
				description: "Select the type of change that you're committing",
				enum: {
					feat: {
						description: 'A new feature (bumps minor)',
						title: 'Features',
						emoji: '✨',
					},
					fix: {
						description: 'A bug fix (bumps patch)',
						title: 'Bug Fixes',
						emoji: '🐛',
					},
					docs: {
						description: 'Documentation only changes (no release)',
						title: 'Documentation',
						emoji: '📚',
					},
					style: {
						description:
							'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) (no release)',
						title: 'Styles',
						emoji: '💎',
					},
					refactor: {
						description: 'A code change that neither fixes a bug nor adds a feature (no release)',
						title: 'Code Refactoring',
						emoji: '📦',
					},
					perf: {
						description: 'A code change that improves performance (bumps patch)',
						title: 'Performance Improvements',
						emoji: '🚀',
					},
					test: {
						description: 'Adding missing tests or correcting existing tests (no release)',
						title: 'Tests',
						emoji: '🚨',
					},
					build: {
						description:
							'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm) (bumps patch)',
						title: 'Builds',
						emoji: '🛠',
					},
					ci: {
						description:
							'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) (no release)',
						title: 'Continuous Integrations',
						emoji: '⚙️',
					},
					chore: {
						description: "Other changes that don't modify src or test files (no release)",
						title: 'Chores',
						emoji: '♻️',
					},
					revert: {
						description: 'Reverts a previous commit (bumps patch)',
						title: 'Reverts',
						emoji: '🗑',
					},
				},
			},
		},
	},
}
