'use strict'
import autoBind from './autoBind.js'
import Cell from './Cell.js'

export default class Grid {

	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} gridWidth
	 * @param {int} gridHeight
	 * @param {int} cellSize
	 * @param {int} intervalTime
	 */
	constructor (canvas, gridWidth, gridHeight, cellSize, intervalTime) {
		this.canvas    = canvas
		this.context2D = canvas.getContext('2d')

		this.gridWidth    = gridWidth
		this.gridHeight   = gridHeight
		this.cellSize     = cellSize
		this.intervalTime = intervalTime

		/** @var {Cell[][]} */ this.cellArray = []
		/** @var {Cell[]} */   this.cellArrayFlat = []

		this.interval = null

		autoBind(this)
	}

	get (y, x) {
		return this.cellArray[y][x]
	}

	init () {
		this.canvas.setAttribute('height', this.gridHeight * (this.cellSize + 1))
		this.canvas.setAttribute('width', this.gridWidth * (this.cellSize + 1))

		this.cellArray = []
		this.cellArrayFlat = []

		for (let y = 0; y < this.gridHeight; y++) {
			this.cellArray[y] = []
			for (let x = 0; x < this.gridWidth; x++) {
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
		for (let y = 0; y < this.gridHeight; y += 5) {
			this.context2D.moveTo(0, y * (this.cellSize + 1))
			this.context2D.lineTo(this.gridWidth * (this.cellSize + 1), y * (this.cellSize + 1))
		}
		for (let x = 0; x < this.gridWidth; x += 5) {
			this.context2D.moveTo(x * (this.cellSize + 1), 0)
			this.context2D.lineTo(x * (this.cellSize + 1), this.gridHeight * (this.cellSize + 1))
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
			this.importGrid(await response.json())
		}
	}

	importGrid (data, allowResize = true) {
		if (allowResize && (data.length > this.gridHeight || data[0].length > this.gridWidth) && confirm('Pattern is bigger than current grid. Adjust grid size?')) {
			if (data.length > this.gridHeight) this.changeHeight(data.length)
			if (data[0].length > this.gridWidth) this.changeWidth(data[0].length)
		}
		for (let y = 0; y < Math.min(data.length, this.gridHeight); y++) {
			for (let x = 0; x < Math.min(data[y].length, this.gridWidth); x++) {
				this.get(y, x).setAlive(Boolean(data[y][x]))
				this.drawCell(this.get(y, x))
			}
		}
	}

	exportGrid () {
		const simpleGrid = new Array(this.gridHeight).fill().map(() => new Array(this.gridWidth).fill(0))
		this.cellArrayFlat.forEach(cell => simpleGrid[cell.y][cell.x] = cell.alive ? 1 : 0)
		return simpleGrid
	}

	importJson (element) {
		this.importGrid(JSON.parse(element.value))
	}

	exportJson (element) {
		element.value = JSON.stringify(this.exportGrid())
			.replace(/],/g, '],\n')
			.replace('[[', '[\n[')
			.replace(']]', ']\n]')
	}

	hflip () {
		const exported = this.exportGrid()
		exported.forEach(e => e.reverse())
		this.importGrid(exported, false)
	}

	vflip () {
		this.importGrid(this.exportGrid().reverse(), false)
	}

	shiftUp () {
		const exported = this.exportGrid()
		exported.shift()
		exported.push(new Array(this.gridWidth).fill(0))
		this.importGrid(exported, false)
	}

	shiftDown () {
		const exported = this.exportGrid()
		exported.unshift(new Array(this.gridWidth).fill(0))
		this.importGrid(exported, false)
	}

	shiftLeft () {
		const exported = this.exportGrid()
		exported.forEach(row => {
			row.shift()
			row.push(0)
		})
		this.importGrid(exported, false)
	}

	shiftRight () {
		const exported = this.exportGrid()
		exported.forEach(row => row.unshift(0))
		this.importGrid(exported, false)
	}

	rotate () {
		const exported = this.exportGrid()
		this.importGrid(
			exported[0].map((column, index) => (
				exported.map(row => row[index])
			)),
			false
		)
	}

	changeWidth (newWidth) {
		const exported = this.exportGrid()
		window.localStorage.gridWidth = this.gridWidth = parseInt(newWidth)
		this.init()
		this.importGrid(exported, false)
	}

	changeHeight (newHeight) {
		const exported = this.exportGrid()
		window.localStorage.gridHeight = this.gridHeight = parseInt(newHeight)
		this.init()
		this.importGrid(exported, false)
	}

	changeCellSize (newCellSize) {
		const exported = this.exportGrid()
		window.localStorage.cellSize = this.cellSize = parseInt(newCellSize)
		this.init()
		this.importGrid(exported, false)
	}

	changeIntervalTime (intervalTime) {
		this.stop()
		window.localStorage.intervalTime = this.intervalTime = parseInt(intervalTime)
		this.start()
	}

	start () {
		this.interval = window.setInterval(this.doStep, this.intervalTime)
	}

	stop () {
		window.clearInterval(this.interval)
		delete this.interval
	}

}
