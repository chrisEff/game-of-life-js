'use strict'
import autoBind from './autoBind.js'
import Cell from './Cell.js'

export default class Grid {

	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} width
	 * @param {int} height
	 * @param {int} cellSize
	 */
	constructor (canvas, width, height, cellSize) {
		this.canvas    = canvas
		this.context2D = canvas.getContext('2d')

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
		this.canvas.setAttribute('height', this.height * (this.cellSize + 1))
		this.canvas.setAttribute('width', this.width * (this.cellSize + 1))

		this.cellArray = []
		this.cellArrayFlat = []

		for (let y = 0; y < this.height; y++) {
			this.cellArray[y] = []
			for (let x = 0; x < this.width; x++) {
				const cell = new Cell(x, y, this)
				this.cellArray[y][x] = cell
				this.cellArrayFlat.push(cell)
				this.drawCell(cell)
			}
		}

		// second loop is necessary, cause neighbors can only be fetched AFTER all cells were created
		this.cellArrayFlat.forEach(cell => cell.initNeighbors())

		this.drawGuides()
	}

	drawGuides () {
		this.context2D.strokeStyle = '#EEEEEE'
		for (let y = 0; y < this.height; y += 5) {
			this.context2D.moveTo(0, y * (this.cellSize + 1))
			this.context2D.lineTo(this.width * (this.cellSize + 1), y * (this.cellSize + 1))
		}
		for (let x = 0; x < this.width; x += 5) {
			this.context2D.moveTo(x * (this.cellSize + 1), 0)
			this.context2D.lineTo(x * (this.cellSize + 1), this.height * (this.cellSize + 1))
		}
		this.context2D.stroke()
	}

	drawCell (cell) {
		cell.alive
			? this.context2D.fillRect(cell.xPos, cell.yPos, this.cellSize, this.cellSize)
			: this.context2D.clearRect(cell.xPos, cell.yPos, this.cellSize, this.cellSize)
	}

	randomize () {
		this.cellArrayFlat.forEach(cell => {
			cell.setAlive(Boolean(Math.round(Math.random())))
			this.drawCell(cell)
		})
	}

	doStep () {
		this.cellArrayFlat
		// collect cells that need to be toggled
			.filter(cell => {
				return cell.alive
					? (cell.livingNeighborCount < 2 || cell.livingNeighborCount > 3)
					: cell.livingNeighborCount === 3
			})
			// toggle them
			.forEach(cell => {
				cell.toggle()
				this.drawCell(cell)
			})
	}

	async loadPattern (name) {
		if (name) {
			const response = await fetch(`patterns/${name}.json`)
			this.importGrid(await response.json(), true)
		}
	}

	importGrid(data, allowResize = false) {
		if (allowResize && (data.length > this.height || data[0].length > this.width) && confirm('Pattern is bigger than current grid. Adjust grid size?')) {
			if (data.length > this.height) this.setHeight(data.length)
			if (data[0].length > this.width) this.setWidth(data[0].length)
		}
		for (let y = 0; y < Math.min(data.length, this.height); y++) {
			for (let x = 0; x < Math.min(data[y].length, this.width); x++) {
				this.get(y, x).setAlive(Boolean(data[y][x]))
				this.drawCell(this.get(y, x))
			}
		}
	}

	exportGrid () {
		const simpleGrid = new Array(this.height).fill().map(() => new Array(this.width).fill(0))
		this.cellArrayFlat.forEach(cell => simpleGrid[cell.y][cell.x] = cell.alive ? 1 : 0)
		return simpleGrid
	}

	importJson (value) {
		this.importGrid(JSON.parse(value), true)
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

	setWidth (newWidth) {
		const exported = this.exportGrid()
		this.width = parseInt(newWidth)
		this.init()
		this.importGrid(exported)
	}

	setHeight (newHeight) {
		const exported = this.exportGrid()
		this.height = parseInt(newHeight)
		this.init()
		this.importGrid(exported)
	}

	setCellSize (newCellSize) {
		const exported = this.exportGrid()
		this.cellSize = parseInt(newCellSize)
		this.init()
		this.importGrid(exported)
	}

}
