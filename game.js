jQuery.noConflict();

function $(id) {
	return document.getElementById(id);
}

document.addEventListener("DOMContentLoaded", function(event) {
	const grid = new Grid($('canvas'), 400, 300, 2, 1);
    grid.init();

	$('start').onclick     = () => grid.start();
	$('stop').onclick      = () => grid.stop();
	$('step').onclick      = () => grid.doStep();
	$('gliderGun').onclick = () => grid.loadPattern('glider-gun');
	$('randomize').onclick = () => grid.randomize();
	$('reset').onclick     = () => grid.init();

	$('gridWidth').onchange    = (event) => grid.changeWidth(event.srcElement.value);
	$('gridHeight').onchange   = (event) => grid.changeHeight(event.srcElement.value);
	$('intervalTime').onchange = (event) => grid.changeInterval(event.srcElement.value);

	$('import').onclick = () => grid.importJson($('importExport'));
	$('export').onclick = () => grid.exportJson($('importExport'));
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

	this.get = function (y, x) {
		return this.cellArray[y][x];
	};

	this.init = function () {
		this.cellArray = [];
		this.cellArrayFlat = [];

		this.canvas.setAttribute('height', this.gridHeight * (this.cellSize+1));
		this.canvas.setAttribute('width', this.gridWidth * (this.cellSize+1));

		$('gridHeight').value = this.gridHeight;
		$('gridWidth').value = this.gridWidth;

		for (let y = 0; y < this.gridHeight; y++) {
			this.cellArray[y] = [];
			for (let x = 0; x < this.gridWidth; x++) {
				this.cellArray[y][x] = new Cell(x, y, this);
			}
		}

		// second loop is necessary, cause neighbors can only be fetched AFTER all cells were created
		for (let y = 0; y < this.gridHeight; y++) {
			for (let x = 0; x < this.gridWidth; x++) {
				this.cellArrayFlat.push(this.cellArray[y][x]);
				this.cellArray[y][x].draw();
				this.cellArray[y][x].initNeighbors();
			}
		}
	};

	this.randomize = function () {
		let cell, cellsNew = [];
		while (cell = this.cellArrayFlat.pop()) {
			cell.alive = Math.round(Math.random());
			cell.draw();
			cellsNew.push(cell);
		}
		this.cellArrayFlat = cellsNew;
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

	this.setJson = function (jsonString) {
		this.setData(JSON.parse(jsonString));
	};

	this.loadPattern = function (name) {
		let that = this;
		jQuery.getJSON("patterns/" + name + ".json", function (json) {
			that.setData(json);
		});
	};

	this.setData = function (data) {
		let yMax = data.length > this.gridHeight ? this.gridHeight : data.length;

		for (y = 0; y < yMax; y++) {
			let xMax = (data[y].length > this.gridWidth) ? this.gridWidth : data[y].length;
			for (x = 0; x < xMax; x++) {
				this.cellArray[y][x].alive = data[y][x];
				this.cellArray[y][x].draw();
			}
		}
	};

	this.importJson = function (element) {
		this.setJson(element.value);
	};

	this.exportJson = function (element) {
		let simpleGrid = [];
		let cell, row, gridTmp = this.cellArray.slice();
		while (row = gridTmp.pop()) {
			row = row.slice();
			while (cell = row.pop()) {
				if (!simpleGrid[cell.y]) {
					simpleGrid[cell.y] = [];
				}
				simpleGrid[cell.y][cell.x] = cell.alive ? 1 : 0;
			}
		}

		element.value = JSON.stringify(simpleGrid);
	};

	this.changeWidth = function (newWidth) {
		this.gridWidth = newWidth;
		this.init();
	};

	this.changeHeight = function (newHeight) {
		this.gridHeight = newHeight;
		this.init();
	};

	this.changeInterval = function (intervalTime) {
		this.stop();
		this.intervalTime = intervalTime;
		this.start();
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