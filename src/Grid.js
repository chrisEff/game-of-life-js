'use strict'
import autoBind from './autoBind.js'
import Cell from './Cell.js'

export default class Grid {

	/**
	 * @param {int} width
	 * @param {int} height
	 * @param {int} cellSize
	 */
	constructor (width, height, cellSize) {
		this.width    = width
		this.height   = height
		this.cellSize = cellSize

		/** @var {Cell[][]} */ this.cellArray = []
		/** @var {Cell[]} */   this.cellArrayFlat = []

		autoBind(this)
	}

	get (y, x) {
		return this.cellArray[y][x]
	}

	init () {
		this.cellArray = []
		this.cellArrayFlat = []

		for (let y = 0; y < this.height; y++) {
			this.cellArray[y] = []
			for (let x = 0; x < this.width; x++) {
				const cell = new Cell(x, y, this)
				this.cellArray[y][x] = cell
				this.cellArrayFlat.push(cell)
			}
		}

		// second loop is necessary, cause neighbors can only be fetched AFTER all cells were created
		this.cellArrayFlat.forEach(cell => cell.initNeighbors())
	}

	randomize () {
		this.cellArrayFlat.forEach(cell => {
			cell.setAlive(Boolean(Math.round(Math.random())))
		})
	}

	doStep () {
		const cells = this.cellArrayFlat
			// collect cells that need to be toggled
			.filter(cell => {
				return cell.alive
					? (cell.livingNeighborCount < 2 || cell.livingNeighborCount > 3)
					: cell.livingNeighborCount === 3
			})

		// toggle them
		cells.forEach(cell => {
			cell.toggle()
		})

		return cells
	}

	importGrid (data) {
		for (let y = 0; y < Math.min(data.length, this.height); y++) {
			for (let x = 0; x < Math.min(data[y].length, this.width); x++) {
				this.get(y, x).setAlive(Boolean(data[y][x]))
			}
		}
	}

	exportGrid () {
		const simpleGrid = new Array(this.height).fill().map(() => new Array(this.width).fill(0))
		this.cellArrayFlat.forEach(cell => simpleGrid[cell.y][cell.x] = cell.alive ? 1 : 0)
		return simpleGrid
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
		exported.push(new Array(this.width).fill(0))
		this.importGrid(exported)
	}

	shiftDown () {
		const exported = this.exportGrid()
		exported.unshift(new Array(this.width).fill(0))
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
