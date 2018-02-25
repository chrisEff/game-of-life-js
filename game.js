function $(id) {
	return document.getElementById(id);
}

function Grid(canvas, gridWidth, gridHeight, dotSize, intervalTime) {
	this.canvas = canvas;
	this.context2D = canvas.getContext('2d');

	this.gridWidth    = gridWidth;
	this.gridHeight   = gridHeight;
	this.dotSize      = dotSize;
	this.intervalTime = intervalTime;

	this.dotArray = [];
	this.dotArrayFlat = [];
	this.interval = null;

	this.context2D.fillStyle = '#000000';

	this.get = function (y, x) {
		return this.dotArray[y][x];
	};

	this.init = function () {
		this.dotArray = [];
		this.dotArrayFlat = [];

		this.canvas.setAttribute('height', this.gridHeight * (this.dotSize+1));
		this.canvas.setAttribute('width', this.gridWidth * (this.dotSize+1));

		$('gridHeight').value = this.gridHeight;
		$('gridWidth').value = this.gridWidth;

		for (let y = 0; y < this.gridHeight; y++) {
			this.dotArray[y] = [];
			for (let x = 0; x < this.gridWidth; x++) {
				this.dotArray[y][x] = new Dot(x, y, this);
			}
		}

		// second loop is necessary, cause neighbors can only be fetched AFTER all dots were created
		for (let y = 0; y < this.gridHeight; y++) {
			for (let x = 0; x < this.gridWidth; x++) {
				this.dotArrayFlat.push(this.dotArray[y][x]);
				this.dotArray[y][x].draw();
				this.dotArray[y][x].initNeighbors();
			}
		}
	};

	this.randomize = function () {
		let dot, dotsNew = [];
		while (dot = this.dotArrayFlat.pop()) {
			dot.alive = Math.round(Math.random());
			dot.draw();
			dotsNew.push(dot);
		}
		this.dotArrayFlat = dotsNew;
	};

	this.doStep = function () {
		this.dotArrayFlat
			// collect dots that need to be toggled
			.filter(dot => {
				let livingNeighborCount = dot.neighbors.filter(neighbor => neighbor.alive).length;
				if (!dot.alive) {
					return livingNeighborCount === 3;
				}
				return (livingNeighborCount < 2 || livingNeighborCount > 3);
			})
			// toggle them
			.forEach(dot => {
				dot.alive = !dot.alive;
				dot.draw();
			})
	};

	this.setJson = function (jsonString) {
		this.setData(JSON.parse(jsonString));
	};

	this.setData = function (data) {
		let yMax = data.length > this.gridHeight ? this.gridHeight : data.length;

		for (y = 0; y < yMax; y++) {
			let xMax = (data[y].length > this.gridWidth) ? this.gridWidth : data[y].length;
			for (x = 0; x < xMax; x++) {
				this.dotArray[y][x].alive = data[y][x];
				this.dotArray[y][x].draw();
			}
		}
	};

	this.importJson = function (element) {
		this.setJson(element.value);
	};

	this.exportJson = function (element) {
		let simpleGrid = [];
		let dot, row, gridTmp = this.dotArray.slice();
		while (row = gridTmp.pop()) {
			row = row.slice();
			while (dot = row.pop()) {
				if (!simpleGrid[dot.y]) {
					simpleGrid[dot.y] = [];
				}
				simpleGrid[dot.y][dot.x] = dot.alive ? 1 : 0;
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
		$('start').style.visibility = 'hidden';
		$('stop').style.visibility = 'visible';
		this.interval = window.setInterval(() => { grid.doStep() }, this.intervalTime);
	};

	this.stop = function () {
		$('start').style.visibility = 'visible';
		$('stop').style.visibility = 'hidden';
		window.clearInterval(this.interval);
	}
}


function Dot(x, y, grid) {

	// x + y in grid
	this.x = x;
	this.y = y;

	// x + y on screen
	this.xPos = x * (grid.dotSize+1);
	this.yPos = y * (grid.dotSize+1);

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
			this.grid.context2D.fillRect(this.xPos, this.yPos, this.grid.dotSize, this.grid.dotSize) :
			this.grid.context2D.clearRect(this.xPos, this.yPos, this.grid.dotSize, this.grid.dotSize);
	}

}