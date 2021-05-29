const {defaults} = require('jest-config')

module.exports = {
	moduleFileExtensions: ['ts', 'tsx', ...defaults.moduleFileExtensions],
	moduleDirectories: [...defaults.moduleDirectories],
	transform: {"\\.[jt]sx?$": "babel-jest"},
}