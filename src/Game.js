import autoBind from './autoBind.js'

const $ = (id) => document.getElementById(id)

/**
 * @property {Grid} grid
 */
export default class Game {

	/**
	 * @param {Grid} grid
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} width
	 * @param {int} height
	 * @param {int} intervalTime
	 * @param {int} cellSize
	 */
	constructor (grid, canvas, width, height, intervalTime, cellSize) {
		this.grid = grid
		this.canvas = canvas
		this.context2D = canvas.getContext('2d')
		this.width = width
		this.height = height
		this.intervalTime = intervalTime
		this.interval = null
		this.cellSize = cellSize

		this.context2D.fillStyle = '#000000'

		canvas.onclick = (event) => {
			const cell = this.grid.get(Math.floor(event.offsetY / (this.cellSize + 1)), Math.floor(event.offsetX / (this.cellSize + 1)))
			cell.setAlive(!cell.alive)
			this.drawCell(cell)
		}

		autoBind(this)
	}

	init () {
		this.canvas.setAttribute('height', this.height * (this.cellSize + 1))
		this.canvas.setAttribute('width', this.width * (this.cellSize + 1))
		this.grid.init(this.width, this.height, this.cellSize)
		this.drawGuides()
	}

	reset () {
		this.grid.reset()
		this.drawFullFrame()
	}

	drawGuides () {
		const multiplier = this.cellSize + 1
		const xMax = this.width * multiplier
		const yMax = this.height * multiplier
		this.context2D.strokeStyle = '#EEEEEE'

		for (let y = 0; y < this.height; y += 5) {
			this.context2D.moveTo(0, y * multiplier)
			this.context2D.lineTo(xMax, y * multiplier)
		}
		for (let x = 0; x < this.width; x += 5) {
			this.context2D.moveTo(x * multiplier, 0)
			this.context2D.lineTo(x * multiplier, yMax)
		}

		this.context2D.stroke()
	}

	start () {
		$('start').style.display = 'none'
		$('stop').style.display = 'initial'
		this.interval = window.setInterval(this.doStep, this.intervalTime)
	}

	stop () {
		$('start').style.display = 'initial'
		$('stop').style.display = 'none'
		window.clearInterval(this.interval)
		delete this.interval
	}

	doStep () {
		const cells = this.grid.doStep()
		cells.forEach(cell => {
			cell.toggle()
			this.drawCell(cell)
		})
	}

	drawFullFrame () {
		const cells = this.grid.cellArrayFlat
		cells.forEach(this.drawCell)
	}

	drawCell (cell) {
		cell.alive
			? this.context2D.fillRect(cell.xPos, cell.yPos, this.cellSize, this.cellSize)
			: this.context2D.clearRect(cell.xPos, cell.yPos, this.cellSize, this.cellSize)
	}

	/**
	 * @param {int|string} intervalTime
	 */
	changeIntervalTime (intervalTime) {
		this.stop()
		window.localStorage.intervalTime = this.intervalTime = parseInt(intervalTime)
		this.start()
	}

	/**
	 * @param {int|string} newWidth
	 */
	setWidth (newWidth) {
		newWidth = parseInt(newWidth)
		window.localStorage.gridWidth = newWidth
		const exported = this.grid.exportGrid()
		this.width = newWidth
		this.init()
		this.grid.importGrid(exported)
		this.drawFullFrame()
	}

	/**
	 * @param {int|string} newHeight
	 */
	setHeight (newHeight) {
		newHeight = parseInt(newHeight)
		window.localStorage.gridHeight = newHeight
		const exported = this.grid.exportGrid()
		this.height = newHeight
		this.init()
		this.grid.importGrid(exported)
		this.drawFullFrame()
	}

	/**
	 * @param {int|string} newCellSize
	 */
	setCellSize (newCellSize) {
		newCellSize = parseInt(newCellSize)
		window.localStorage.cellSize = newCellSize
		const exported = this.grid.exportGrid()
		this.cellSize = newCellSize
		this.init()
		this.grid.importGrid(exported)
		this.drawFullFrame()
	}

	async loadPattern (name, reset = false, offsetX = 0, offsetY = 0) {
		if (reset) {
			this.reset()
		}
		if (name) {
			const response = await fetch(`patterns/${name}.rle`)
			this.grid.importRLE(await response.text(), offsetX, offsetY)
		}
		this.drawFullFrame()
	}
}
