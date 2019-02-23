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
			this.cellArray[y] = []
			for (let x = 0; x < width; x++) {
				const cell = new Cell(x, y, this, cellSize)
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
		return this.cellArrayFlat
			.filter(cell => {
				return cell.alive
					? (cell.livingNeighborCount < 2 || cell.livingNeighborCount > 3)
					: cell.livingNeighborCount === 3
			})
	}

	importGrid (data) {
		for (let y = 0; y < Math.min(data.length, this.cellArray.length); y++) {
			for (let x = 0; x < Math.min(data[y].length, this.cellArray[0].length); x++) {
				this.get(y, x).setAlive(Boolean(data[y][x]))
			}
		}
	}

	exportGrid () {
		const simpleGrid = new Array(this.cellArray.length).fill().map(() => new Array(this.cellArray[0].length).fill(0))
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
