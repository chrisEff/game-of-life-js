jQuery.noConflict();

function $(id) {
	return document.getElementById(id);
}

document.addEventListener("DOMContentLoaded", (event) => {
	const grid = new Grid($('canvas'), 64, 64, 10, 1);
    grid.init();

	$('start').onclick     = () => grid.start();
	$('stop').onclick      = () => grid.stop();
	$('step').onclick      = () => grid.doStep();
	$('hflip').onclick     = () => grid.hflip();
	$('vflip').onclick     = () => grid.vflip();
	$('reset').onclick     = () => grid.init();
	$('randomize').onclick = () => grid.randomize();

	Array.from(document.getElementsByClassName('pattern')).forEach(
		el => el.onclick = event => grid.loadPattern(event.srcElement.innerHTML)
	);

	$('gridWidth').onchange    = (event) => grid.changeWidth(event.srcElement.value);
	$('gridHeight').onchange   = (event) => grid.changeHeight(event.srcElement.value);
	$('cellSize').onchange     = (event) => grid.changeCellSize(event.srcElement.value);
	$('intervalTime').onchange = (event) => grid.changeIntervalTime(event.srcElement.value);

	$('import').onclick = () => grid.importJson($('importExport'));
	$('export').onclick = () => grid.exportJson($('importExport'));

	document.addEventListener("keydown", (event) => {
		switch (event.key) {
			case "s": grid.startStop(); break;
			case "t": grid.doStep(); break;
			case "r": grid.init(); break;
			case "a": grid.randomize(); break;
			case "h": grid.hflip(); break;
			case "v": grid.vflip(); break;
		}
	});
});

function Grid(canvas, gridWidth, gridHeight, cellSize, intervalTime) {
	this.canvas = canvas;
	this.context2D = canvas.getContext('2d');

	this.gridWidth    = gridWidth;
	this.gridHeight   = gridHeight;
	this.cellSize     = cellSize;
	this.intervalTime = intervalTime;

	this.cellArray = [];
	this.cellArrayFlat = [];
	this.interval = null;

	this.context2D.fillStyle = '#000000';

	this.canvas.onclick = (event) => {
		const cell = this.get(Math.floor(event.offsetY / (cellSize+1)), Math.floor(event.offsetX / (cellSize+1)));
		cell.alive = !cell.alive;
		cell.draw();
	};

	this.get = function (y, x) {
		return this.cellArray[y][x];
	};

	this.init = function () {
		this.canvas.setAttribute('height', this.gridHeight * (this.cellSize+1));
		this.canvas.setAttribute('width', this.gridWidth * (this.cellSize+1));
		$('gridHeight').value = this.gridHeight;
		$('gridWidth').value = this.gridWidth;
		$('cellSize').value = this.cellSize;
		$('intervalTime').value = this.intervalTime;

		this.cellArray = [];
		this.cellArrayFlat = [];

		this.context2D.strokeStyle = "#EEEEEE";
		for (let y = 0; y < this.gridHeight; y++) {
			if (y % 5 === 0) {
				this.context2D.moveTo(0, y * (this.cellSize+1));
				this.context2D.lineTo(this.gridWidth * (this.cellSize+1), y * (this.cellSize+1));
			}
			this.cellArray[y] = [];
			for (let x = 0; x < this.gridWidth; x++) {
				if (y === 0 && x % 5 === 0) {
					this.context2D.moveTo(x * (this.cellSize+1), 0);
					this.context2D.lineTo(x * (this.cellSize+1), this.gridHeight * (this.cellSize+1));
				}
				let cell = new Cell(x, y, this);
				this.cellArray[y][x] = cell;
				this.cellArrayFlat.push(cell);
				cell.draw();
			}
		}
		this.context2D.stroke();

		// second loop is necessary, cause neighbors can only be fetched AFTER all cells were created
		this.cellArrayFlat.forEach(cell => cell.initNeighbors());
	};

	this.randomize = function () {
		this.cellArrayFlat.forEach(cell => {
			cell.alive = Math.round(Math.random());
			cell.draw();
		});
	};

	this.doStep = function () {
		this.cellArrayFlat
			// collect cells that need to be toggled
			.filter(cell => {
				let livingNeighborCount = cell.neighbors.filter(neighbor => neighbor.alive).length;
				if (!cell.alive) {
					return livingNeighborCount === 3;
				}
				return (livingNeighborCount < 2 || livingNeighborCount > 3);
			})
			// toggle them
			.forEach(cell => {
				cell.alive = !cell.alive;
				cell.draw();
			})
	};

	this.loadPattern = function (name) {
		if (name) jQuery.getJSON(`patterns/${name}.json`, (json) => {
			this.importGrid(json);
		});
	};

	this.importGrid = function (data) {
		let yMax = data.length > this.gridHeight ? this.gridHeight : data.length;
		for (y = 0; y < yMax; y++) {
			let xMax = (data[y].length > this.gridWidth) ? this.gridWidth : data[y].length;
			for (x = 0; x < xMax; x++) {
				this.cellArray[y][x].alive = data[y][x];
				this.cellArray[y][x].draw();
			}
		}
	};

	this.exportGrid = function () {
		let simpleGrid = [];
		this.cellArrayFlat.forEach(cell => {
			if (!simpleGrid[cell.y]) {
				simpleGrid[cell.y] = [];
			}
			simpleGrid[cell.y][cell.x] = cell.alive ? 1 : 0;
		});
		return simpleGrid;
	};

	this.importJson = function (element) {
		this.importGrid(JSON.parse(element.value));
	};

	this.exportJson = function (element) {
		element.value = JSON.stringify(this.exportGrid())
			.replace(/],/g, '],\n')
			.replace('[[', '[\n[')
			.replace(']]', ']\n]');
	};

	this.hflip = function () {
		let exported = this.exportGrid();
		exported.forEach(e => e.reverse());
		this.importGrid(exported);
	};

	this.vflip = function () {
		this.importGrid(this.exportGrid().reverse());
	};

	this.changeWidth = function (newWidth) {
		let exported = this.exportGrid();
		this.gridWidth = parseInt(newWidth);
		this.init();
		this.importGrid(exported);
	};

	this.changeHeight = function (newHeight) {
		let exported = this.exportGrid();
		this.gridHeight = parseInt(newHeight);
		this.init();
		this.importGrid(exported);
	};

	this.changeCellSize = function (newCellSize) {
		let exported = this.exportGrid();
		this.cellSize = parseInt(newCellSize);
		this.init();
		this.importGrid(exported);
	};

	this.changeIntervalTime = function (intervalTime) {
		this.stop();
		this.intervalTime = parseInt(intervalTime);
		this.start();
	};

	this.startStop = function () {
		this.interval ? this.stop() : this.start();
	};

	this.start = function () {
		$('start').style.display = 'none';
		$('stop').style.display = 'initial';
		this.interval = window.setInterval(() => this.doStep(), this.intervalTime);
	};

	this.stop = function () {
		$('start').style.display = 'initial';
		$('stop').style.display = 'none';
		window.clearInterval(this.interval);
		delete this.interval;
	}
}

function Cell(x, y, grid) {

	// x + y in grid
	this.x = x;
	this.y = y;

	// x + y on screen
	this.xPos = x * (grid.cellSize+1);
	this.yPos = y * (grid.cellSize+1);

	this.grid = grid;
	this.alive = false;

	this.initNeighbors = function () {
		this.neighbors = [];
		if (this.y > 0) {
			if (this.x > 0) this.neighbors.push(this.grid.get(this.y - 1, this.x - 1));
			this.neighbors.push(this.grid.get(this.y - 1, this.x));
			if ((this.x + 1) < this.grid.gridWidth) this.neighbors.push(this.grid.get(this.y - 1, this.x + 1));
		}

		if (this.x > 0) this.neighbors.push(this.grid.get(this.y, this.x - 1));
		if ((this.x + 1) < this.grid.gridWidth) this.neighbors.push(this.grid.get(this.y, this.x + 1));

		if ((this.y + 1) < this.grid.gridHeight) {
			if (this.x > 0) this.neighbors.push(this.grid.get(this.y + 1, this.x - 1));
			this.neighbors.push(this.grid.get(this.y + 1, this.x));
			if ((this.x + 1) < this.grid.gridWidth) this.neighbors.push(this.grid.get(this.y + 1, this.x + 1));
		}
	};

	this.draw = function () {
		this.alive ?
			this.grid.context2D.fillRect(this.xPos, this.yPos, this.grid.cellSize, this.grid.cellSize) :
			this.grid.context2D.clearRect(this.xPos, this.yPos, this.grid.cellSize, this.grid.cellSize);
	}
}