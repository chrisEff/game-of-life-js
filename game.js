const $ = (id) => document.getElementById(id)

/**
 * simplified version of auto-bind: https://www.npmjs.com/package/auto-bind
 */
const autoBind = (self) => {
	Object.getOwnPropertyNames(self.constructor.prototype)
		.filter(key => key !== 'constructor' && typeof self[key] === 'function')
		.forEach(key => self[key] = self[key].bind(self))
}

document.addEventListener('DOMContentLoaded', (event) => {
	const grid = new Grid(
		$('canvas'),
		window.localStorage.gridWidth || 128,
		window.localStorage.gridHeight || 128,
		window.localStorage.cellSize || 4,
		window.localStorage.intervalTime || 1
	)
	grid.init()

	const keymap = {
		s: grid.startStop,
		t: grid.doStep,
		h: grid.hflip,
		v: grid.vflip,
		o: grid.rotate,
		r: grid.init,
		a: grid.randomize,
		ArrowDown:  grid.shiftDown,
		ArrowUp:    grid.shiftUp,
		ArrowLeft:  grid.shiftLeft,
		ArrowRight: grid.shiftRight,
	}

	$('start').onclick     = grid.start
	$('stop').onclick      = grid.stop
	$('step').onclick      = grid.doStep
	$('hflip').onclick     = grid.hflip
	$('vflip').onclick     = grid.vflip
	$('rotate').onclick    = grid.rotate
	$('reset').onclick     = grid.init
	$('randomize').onclick = grid.randomize

	$('runBenchmark').onclick = () => {
		const steps = $('benchmarkSteps').value
		const startTime = performance.now()
		for (let i = 0; i < steps; i++) {
			grid.doStep()
		}
		console.log(`Executing ${steps} steps took ${performance.now() - startTime}ms.`)
	}

	Array.from(document.getElementsByClassName('pattern')).forEach(
		el => el.onclick = event => grid.loadPattern(event.srcElement.innerHTML)
	)

	$('gridWidth').onchange    = (event) => grid.changeWidth(event.srcElement.value)
	$('gridHeight').onchange   = (event) => grid.changeHeight(event.srcElement.value)
	$('cellSize').onchange     = (event) => grid.changeCellSize(event.srcElement.value)
	$('intervalTime').onchange = (event) => grid.changeIntervalTime(event.srcElement.value)

	$('import').onclick = () => grid.importJson($('importExport'))
	$('export').onclick = () => grid.exportJson($('importExport'))

	document.addEventListener('keydown', (event) => {
		if (event.srcElement.tagName.toLowerCase() === 'body' && keymap.hasOwnProperty(event.key)) {
			keymap[event.key]()
			event.preventDefault()
		}
	})
})

class Grid {

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
		$('gridHeight').value = this.gridHeight
		$('gridWidth').value = this.gridWidth
		$('cellSize').value = this.cellSize
		$('intervalTime').value = this.intervalTime

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

	startStop () {
		this.interval ? this.stop() : this.start()
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

}

class Cell {

	constructor (x, y, grid) {
		this.grid = grid

		// x + y in grid
		this.x = x
		this.y = y

		// x + y on screen
		this.xPos = x * (grid.cellSize + 1)
		this.yPos = y * (grid.cellSize + 1)

		this.alive = false
		this.livingNeighborCount = 0

		autoBind(this)
	}

	initNeighbors () {
		this.neighbors = [];
		[
			{x: this.x - 1, y: this.y - 1},
			{x: this.x - 1, y: this.y},
			{x: this.x - 1, y: this.y + 1},
			{x: this.x,     y: this.y - 1},
			{x: this.x,     y: this.y + 1},
			{x: this.x + 1, y: this.y - 1},
			{x: this.x + 1, y: this.y},
			{x: this.x + 1, y: this.y + 1},
		].forEach(coords => {
			try {
				let neighbor = this.grid.get(coords.y, coords.x)
				if (neighbor) this.neighbors.push(neighbor)
			} catch (ignore) {}
		})
	}

	setAlive (alive) {
		if (this.alive === alive) {
			return
		}
		this.alive = alive
		this.alive
			? this.neighbors.forEach(neighbor => neighbor.livingNeighborCount++)
			: this.neighbors.forEach(neighbor => neighbor.livingNeighborCount--)
	}

	toggle () {
		this.alive = !this.alive
		this.alive
			? this.neighbors.forEach(neighbor => neighbor.livingNeighborCount++)
			: this.neighbors.forEach(neighbor => neighbor.livingNeighborCount--)
	}

	draw () {
		this.alive
			? this.grid.context2D.fillRect(this.xPos, this.yPos, this.grid.cellSize, this.grid.cellSize)
			: this.grid.context2D.clearRect(this.xPos, this.yPos, this.grid.cellSize, this.grid.cellSize)
	}

}
