'use strict'
import autoBind from './util/autoBind.js'
import Cell from './Cell.js'

/**
 * @property {Cell[][]} cellArray
 * @property {Cell[]} cellArrayFlat
 */
export default class Grid {
	constructor() {
		this.cellArray = []
		this.cellArrayFlat = []

		autoBind(this)
	}

	/**
	 * @param {int} y
	 * @param {int} x
	 * @returns {Cell}
	 */
	get(y, x) {
		return this.cellArray[y][x]
	}

	/**
	 * @param {int} width
	 * @param {int} height
	 * @param {int} cellSize
	 */
	init(width, height, cellSize) {
		this.cellArray = []
		this.cellArrayFlat = []

		for (let y = 0; y < height; y++) {
			const row = []
			for (let x = 0; x < width; x++) {
				const cell = new Cell(x, y, this, cellSize)
				row.push(cell)
				this.cellArrayFlat.push(cell)
			}
			this.cellArray.push(row)
		}

		// second loop is necessary, cause neighbors can only be fetched AFTER all cells were created
		this.cellArrayFlat.forEach(cell => cell.initNeighbors())
	}

	reset() {
		this.cellArrayFlat.forEach(cell => cell.setAlive(false))
	}

	randomize() {
		this.cellArrayFlat.forEach(cell => {
			cell.setAlive(Boolean(Math.round(Math.random())))
		})
	}

	// prettier-ignore
	doStep() {
		const result = {
			toggleOn: [],
			toggleOff: [],
		}

		this.cellArrayFlat
			.forEach(cell => {
				if (cell.alive) {
					if (cell.livingNeighborCount < 2 || cell.livingNeighborCount > 3) {
						result.toggleOff.push(cell)
					}
				} else if (cell.livingNeighborCount === 3) {
					result.toggleOn.push(cell)
				}
			})

		return result
	}

	/**
	 * @param {int[][]} data
	 * @param {int} offsetX
	 * @param {int} offsetY
	 */
	importGrid(data, offsetX = 0, offsetY = 0) {
		if (offsetX === -1) {
			offsetX = Math.max(0, Math.floor((this.cellArray[0].length - data[0].length) / 2))
		}
		if (offsetY === -1) {
			offsetY = Math.max(0, Math.floor((this.cellArray.length - data.length) / 2))
		}
		const height = Math.min(data.length + offsetY, this.cellArray.length)
		const width = Math.min(data[0].length + offsetX, this.cellArray[0].length)
		for (let y = offsetY; y < height; y++) {
			for (let x = offsetX; x < width; x++) {
				this.cellArray[y][x].setAlive(Boolean(data[y - offsetY][x - offsetX]))
			}
		}
	}

	/**
	 * @param {boolean} crop
	 * @returns {(number)[][]}
	 */
	exportGrid(crop = false) {
		const result = this.cellArray.map(row => row.map(cell => (cell.alive ? 1 : 0)))

		if (crop) {
			// Remove empty rows at the end...
			while (result.length) {
				const lastRow = result.pop()
				if (lastRow.filter(v => v === 1).length > 0) {
					// ...until we find the first non-empty one.
					result.push(lastRow)
					break
				}
			}

			// TODO crop other sides as well...
		}

		return result
	}

	/**
	 * @param {string} value
	 * @param {int} offsetX
	 * @param {int} offsetY
	 */
	importJson(value, offsetX = 0, offsetY = 0) {
		this.importGrid(JSON.parse(value), offsetX, offsetY)
	}

	/**
	 * @returns {string}
	 */
	// prettier-ignore
	exportJson() {
		return JSON.stringify(this.exportGrid(true))
			.replace(/],/g, '],\n')
			.replace('[[', '[\n[')
			.replace(']]', ']\n]')
	}

	/**
	 * @param {string} input
	 * @param {int} offsetX
	 * @param {int} offsetY
	 */
	importRLE(input, offsetX = 0, offsetY = 0) {
		let width = 0
		let result = []
		input
			.split('\n')
			.filter(line => !line.startsWith('#'))
			.join('')
			.replace(/\n/g, '')
			.split('$')
			.forEach(line => {
				const chars = line.split('')
				let num = ''
				const row = []

				while (chars.length) {
					const char = chars.shift()
					if (char === 'b' || char === 'o') {
						if (num === '') num = 1
						for (let i = 0; i < parseInt(num); i++) {
							row.push(char === 'o' ? 1 : 0)
						}
						num = ''
					} else {
						num += char
					}
				}
				result.push(row)

				if (num !== '') {
					for (let i = 1; i < parseInt(num); i++) {
						result.push([0])
					}
				}

				width = Math.max(width, row.length)
			})

		result = result.map(l => {
			const oldLength = l.length
			l.length = width
			return l.fill(0, oldLength)
		})

		this.importGrid(result, offsetX, offsetY)
	}

	/**
	 * @returns {string}
	 */
	exportRLE() {
		let result = ''
		let emptyRowCount = -1

		const data = this.exportGrid(true)
		data.forEach(row => {
			if (row.filter(cell => cell).length < 1) {
				emptyRowCount++
				return
			} else {
				if (emptyRowCount > 0) {
					result += `${emptyRowCount + 1}$`
				} else if (emptyRowCount === 0) {
					result += '$'
				}
				emptyRowCount = 0
			}

			let count = 1
			let lastState = null
			row.forEach(cell => {
				if (cell === lastState) {
					count++
				} else {
					if (lastState !== null) {
						result += `${count}${lastState ? 'o' : 'b'}`
						count = 1
					}
					lastState = cell
				}
			})
			if (lastState) result += `${count}o`
		})

		return result
	}

	hflip() {
		const exported = this.exportGrid()
		exported.forEach(e => e.reverse())
		this.importGrid(exported)
	}

	vflip() {
		this.importGrid(this.exportGrid().reverse())
	}

	shiftUp() {
		const exported = this.exportGrid()
		exported.shift()
		exported.push(new Array(this.cellArray[0].length).fill(0))
		this.importGrid(exported)
	}

	shiftDown() {
		const exported = this.exportGrid()
		exported.unshift(new Array(this.cellArray[0].length).fill(0))
		this.importGrid(exported)
	}

	shiftLeft() {
		const exported = this.exportGrid()
		exported.forEach(row => {
			row.shift()
			row.push(0)
		})
		this.importGrid(exported)
	}

	shiftRight() {
		const exported = this.exportGrid()
		exported.forEach(row => row.unshift(0))
		this.importGrid(exported)
	}

	rotate() {
		const exported = this.exportGrid()

		const result = []
		for (let i = 0; i < exported[0].length; i++) {
			const row = exported.map(e => e[i]).reverse()
			result.push(row)
		}

		this.importGrid(result)
	}
}
