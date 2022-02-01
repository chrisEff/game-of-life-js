export default self => {
	Object.getOwnPropertyNames(self.constructor.prototype)
		.filter(key => key !== 'constructor' && typeof self[key] === 'function')
		.forEach(key => (self[key] = self[key].bind(self)))
}
