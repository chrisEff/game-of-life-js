export default class LocalStorageHelper {
	getJson(key) {
		const raw = localStorage.getItem(key)

		return raw ? JSON.parse(raw) : null
	}

	setJson(key, value) {
		localStorage.setItem(key, JSON.stringify(value))
	}

	setObjectProperty(key, propertyKey, value) {
		const obj = this.getJson(key) || {}
		obj[propertyKey] = value

		this.setJson(key, obj)
	}
}
