'use strict'
import autoBind from './autoBind.js'
import Cell from './Cell.js'

export default class Grid {

	constructor () {
		/** @var {Cell[][]} */ this.cellArray = []
		/** @var {Cell[]} */   this.cellArrayFlat = []

		autoBind(this)
	}

	get (y, x) {
		return this.cellArray[y][x]
	}

	init (width, height, cellSize) {
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

	reset () {
		this.cellArrayFlat.forEach(cell => cell.setAlive(false))
	}

	randomize () {
		this.cellArrayFlat.forEach(cell => {
			cell.setAlive(Boolean(Math.round(Math.random())))
		})
	}

	doStep () {
		return this.cellArrayFlat
			.filter(cell => {
				return cell.alive
					? (cell.livingNeighborCount < 2 || cell.livingNeighborCount > 3)
					: cell.livingNeighborCount === 3
			})
	}

	importGrid (data) {
		const height = Math.min(data.length, this.cellArray.length)
		const width = Math.min(data[0].length, this.cellArray[0].length)
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				this.cellArray[y][x].setAlive(Boolean(data[y][x]))
			}
		}
	}

	exportGrid () {
		return this.cellArray.map(row => row.map(cell => cell.alive ? 1 : 0))
	}

	importJson (value) {
		this.importGrid(JSON.parse(value))
	}

	exportJson () {
		return JSON.stringify(this.exportGrid())
			.replace(/],/g, '],\n')
			.replace('[[', '[\n[')
			.replace(']]', ']\n]')
	}

	hflip () {
		const exported = this.exportGrid()
		exported.forEach(e => e.reverse())
		this.importGrid(exported)
	}

	vflip () {
		this.importGrid(this.exportGrid().reverse())
	}

	shiftUp () {
		const exported = this.exportGrid()
		exported.shift()
		exported.push(new Array(this.cellArray[0].length).fill(0))
		this.importGrid(exported)
	}

	shiftDown () {
		const exported = this.exportGrid()
		exported.unshift(new Array(this.cellArray[0].length).fill(0))
		this.importGrid(exported)
	}

	shiftLeft () {
		const exported = this.exportGrid()
		exported.forEach(row => {
			row.shift()
			row.push(0)
		})
		this.importGrid(exported)
	}

	shiftRight () {
		const exported = this.exportGrid()
		exported.forEach(row => row.unshift(0))
		this.importGrid(exported)
	}

	rotate () {
		const exported = this.exportGrid()
		this.importGrid(exported[0].map((column, index) => (
			exported.map(row => row[index])
		)))
	}
}
