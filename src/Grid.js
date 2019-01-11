'use strict'
import autoBind from './autoBind.js'
import Cell from './Cell.js'

export default class Grid {

	constructor (canvas, gridWidth, gridHeight, cellSize, intervalTime) {
		this.canvas    = canvas
		this.context2D = canvas.getContext('2d')

		this.gridWidth    = gridWidth
		this.gridHeight   = gridHeight
		this.cellSize     = cellSize
		this.intervalTime = intervalTime

		this.cellArray = []
		/** @var {Cell[]} */
		this.cellArrayFlat = []
		this.interval = null

		this.context2D.fillStyle = '#000000'

		this.canvas.onclick = (event) => {
			const cell = this.get(Math.floor(event.offsetY / (this.cellSize + 1)), Math.floor(event.offsetX / (this.cellSize + 1)))
			cell.setAlive(!cell.alive)
			cell.draw()
		}

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

		this.context2D.strokeStyle = '#EEEEEE'
		for (let y = 0; y < this.gridHeight; y++) {
			if (y % 5 === 0) {
				this.context2D.moveTo(0, y * (this.cellSize + 1))
				this.context2D.lineTo(this.gridWidth * (this.cellSize + 1), y * (this.cellSize + 1))
			}
			this.cellArray[y] = []
			for (let x = 0; x < this.gridWidth; x++) {
				if (y === 0 && x % 5 === 0) {
					this.context2D.moveTo(x * (this.cellSize + 1), 0)
					this.context2D.lineTo(x * (this.cellSize + 1), this.gridHeight * (this.cellSize + 1))
				}
				let cell = new Cell(x, y, this)
				this.cellArray[y][x] = cell
				this.cellArrayFlat.push(cell)
				cell.draw()
			}
		}
		this.context2D.stroke()

		// second loop is necessary, cause neighbors can only be fetched AFTER all cells were created
		this.cellArrayFlat.forEach(cell => cell.initNeighbors())
	}

	randomize () {
		this.cellArrayFlat.forEach(cell => {
			cell.setAlive(Boolean(Math.round(Math.random())))
			cell.draw()
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
				cell.draw()
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
				this.get(y, x).draw()
			}
		}
	}

	exportGrid () {
		let simpleGrid = new Array(this.gridHeight).fill().map(() => new Array(this.gridWidth).fill(0))
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
		let exported = this.exportGrid()
		exported.forEach(e => e.reverse())
		this.importGrid(exported, false)
	}

	vflip () {
		this.importGrid(this.exportGrid().reverse(), false)
	}

	shiftUp () {
		let exported = this.exportGrid()
		exported.shift()
		exported.push(new Array(this.gridWidth).fill(0))
		this.importGrid(exported, false)
	}

	shiftDown () {
		let exported = this.exportGrid()
		exported.unshift(new Array(this.gridWidth).fill(0))
		this.importGrid(exported, false)
	}

	shiftLeft () {
		let exported = this.exportGrid()
		exported.forEach(row => {
			row.shift()
			row.push(0)
		})
		this.importGrid(exported, false)
	}

	shiftRight () {
		let exported = this.exportGrid()
		exported.forEach(row => row.unshift(0))
		this.importGrid(exported, false)
	}

	rotate () {
		let eported = this.exportGrid()
		this.importGrid(
			eported[0].map((column, index) => (
				eported.map(row => row[index])
			)),
			false
		)
	}

	changeWidth (newWidth) {
		let exported = this.exportGrid()
		window.localStorage.gridWidth = this.gridWidth = parseInt(newWidth)
		this.init()
		this.importGrid(exported, false)
	}

	changeHeight (newHeight) {
		let exported = this.exportGrid()
		window.localStorage.gridHeight = this.gridHeight = parseInt(newHeight)
		this.init()
		this.importGrid(exported, false)
	}

	changeCellSize (newCellSize) {
		let exported = this.exportGrid()
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
