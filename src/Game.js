import autoBind from './autoBind.js'

const $ = (id) => document.getElementById(id)

export default class Game {
	constructor (grid, canvas, intervalTime) {
		this.grid = grid
		this.canvas = canvas
		this.context2D = canvas.getContext('2d')
		this.intervalTime = intervalTime
		this.interval = null

		autoBind(this)
	}

	start () {
		$('start').style.display = 'none'
		$('stop').style.display = 'initial'
		this.interval = window.setInterval(this.grid.doStep, this.intervalTime)
	}

	stop () {
		$('start').style.display = 'initial'
		$('stop').style.display = 'none'
		window.clearInterval(this.interval)
		delete this.interval
	}

	changeIntervalTime (intervalTime) {
		this.stop()
		window.localStorage.intervalTime = this.intervalTime = parseInt(intervalTime)
		this.start()
	}

	setWidth (newWidth) {
		newWidth = parseInt(newWidth)
		window.localStorage.gridWidth = newWidth
		this.grid.setWidth(newWidth)
	}

	setHeight (newHeight) {
		newHeight = parseInt(newHeight)
		window.localStorage.gridHeight = newHeight
		this.grid.setHeight(newHeight)
	}

	setCellSize (newCellSize) {
		newCellSize = parseInt(newCellSize)
		window.localStorage.cellSize = newCellSize
		this.grid.setCellSize(newCellSize)
	}
}
