export default string => {
	try {
		JSON.parse(string)
		return true
	} catch (e) {
		console.log('isJSON caught:', e)
		return false
	}
}
