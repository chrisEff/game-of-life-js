const $ = (id) => document.getElementById(id)

document.addEventListener('DOMContentLoaded', (event) => {
	const grid = new Grid($('canvas'), 128, 128, 4, 1)
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

function Grid (canvas, gridWidth, gridHeight, cellSize, intervalTime) {
	this.canvas = canvas
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
		cell.alive = !cell.alive
		cell.draw()
	}

	this.get = (y, x) => {
		return this.cellArray[y][x]
	}

	this.init = () => {
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

	this.randomize = () => {
		this.cellArrayFlat.forEach(cell => {
			cell.alive = Math.round(Math.random())
			cell.draw()
		})
	}

	this.doStep = () => {
		this.cellArrayFlat
			// collect cells that need to be toggled
			.filter(cell => {
				let livingNeighborCount = cell.neighbors.filter(neighbor => neighbor.alive).length
				return (!cell.alive)
					? livingNeighborCount === 3
					: (livingNeighborCount < 2 || livingNeighborCount > 3)
			})
			// toggle them
			.forEach(cell => {
				cell.alive = !cell.alive
				cell.draw()
			})
	}

	this.loadPattern = async (name) => {
		if (name) {
			const response = await fetch(`patterns/${name}.json`)
			this.importGrid(await response.json())
		}
	}

	this.importGrid = (data, allowResize = true) => {
		if (allowResize && (data.length > this.gridHeight || data[0].length > this.gridWidth) && confirm('Pattern is bigger than current grid. Adjust grid size?')) {
			if (data.length > this.gridHeight) this.changeHeight(data.length)
			if (data[0].length > this.gridWidth) this.changeWidth(data[0].length)
		}
		for (let y = 0; y < Math.min(data.length, this.gridHeight); y++) {
			for (let x = 0; x < Math.min(data[y].length, this.gridWidth); x++) {
				this.get(y, x).alive = data[y][x]
				this.get(y, x).draw()
			}
		}
	}

	this.exportGrid = () => {
		let simpleGrid = []
		this.cellArrayFlat.forEach(cell => {
			if (!simpleGrid[cell.y]) {
				simpleGrid[cell.y] = []
			}
			simpleGrid[cell.y][cell.x] = cell.alive ? 1 : 0
		})
		return simpleGrid
	}

	this.importJson = (element) => {
		this.importGrid(JSON.parse(element.value))
	}

	this.exportJson = (element) => {
		element.value = JSON.stringify(this.exportGrid())
			.replace(/],/g, '],\n')
			.replace('[[', '[\n[')
			.replace(']]', ']\n]')
	}

	this.hflip = () => {
		let exported = this.exportGrid()
		exported.forEach(e => e.reverse())
		this.importGrid(exported, false)
	}

	this.vflip = () => {
		this.importGrid(this.exportGrid().reverse(), false)
	}
	
	this.shiftUp = () => {
		let exported = this.exportGrid()
		exported.shift()
		exported.push(new Array(this.gridWidth).fill(0))
		this.importGrid(exported, false)
	}
	
	this.shiftDown = () => {
		let exported = this.exportGrid()
		exported.unshift(new Array(this.gridWidth).fill(0))
		this.importGrid(exported, false)
	}

	this.shiftLeft = () => {
		let exported = this.exportGrid()
		exported.forEach(row => {
			row.shift()
			row.push(0)
		})
		this.importGrid(exported, false)
	}

	this.shiftRight = () => {
		let exported = this.exportGrid()
		exported.forEach(row => row.unshift(0))
		this.importGrid(exported, false)
	}

	this.rotate = () => {
		let eported = this.exportGrid()
		this.importGrid(
			eported[0].map((column, index) => (
				eported.map(row => row[index])
			)),
			false
		)
	}

	this.changeWidth = (newWidth) => {
		let exported = this.exportGrid()
		this.gridWidth = parseInt(newWidth)
		this.init()
		this.importGrid(exported, false)
	}

	this.changeHeight = (newHeight) => {
		let exported = this.exportGrid()
		this.gridHeight = parseInt(newHeight)
		this.init()
		this.importGrid(exported, false)
	}

	this.changeCellSize = (newCellSize) => {
		let exported = this.exportGrid()
		this.cellSize = parseInt(newCellSize)
		this.init()
		this.importGrid(exported, false)
	}

	this.changeIntervalTime = (intervalTime) => {
		this.stop()
		this.intervalTime = parseInt(intervalTime)
		this.start()
	}

	this.startStop = () => {
		this.interval ? this.stop() : this.start()
	}

	this.start = () => {
		$('start').style.display = 'none'
		$('stop').style.display = 'initial'
		this.interval = window.setInterval(() => this.doStep(), this.intervalTime)
	}

	this.stop = () => {
		$('start').style.display = 'initial'
		$('stop').style.display = 'none'
		window.clearInterval(this.interval)
		delete this.interval
	}
}

function Cell (x, y, grid) {
	// x + y in grid
	this.x = x
	this.y = y

	// x + y on screen
	const xPos = x * (grid.cellSize + 1)
	const yPos = y * (grid.cellSize + 1)
	
	this.alive = false

	this.initNeighbors = () => {
		this.neighbors = [];
		[
			{x: x - 1, y: y - 1},
			{x: x - 1, y: y},
			{x: x - 1, y: y + 1},
			{x: x, y: y - 1},
			{x: x, y: y + 1},
			{x: x + 1, y: y - 1},
			{x: x + 1, y: y},
			{x: x + 1, y: y + 1},
		].forEach(coords => {
			try {
				let neighbor = grid.get(coords.y, coords.x)
				if (neighbor) this.neighbors.push(neighbor)
			} catch (ignore) {}
		})
	}

	this.draw = () => {
		this.alive
			? grid.context2D.fillRect(xPos, yPos, grid.cellSize, grid.cellSize)
			: grid.context2D.clearRect(xPos, yPos, grid.cellSize, grid.cellSize)
	}
}
