function $(id) {
	return document.getElementById(id);
}

function Grid(canvas, gridWidth, gridHeight, intervalTime) {
	this.canvas = canvas;
	this.context2D = canvas.getContext('2d');

	this.gridWidth = gridWidth;
	this.gridHeight = gridHeight;
	this.intervalTime = intervalTime;

	this.dotArray = [];
	this.dotArrayFlat = [];

	this.toggleDots = [];
	this.interval = null;

	this.context2D.fillStyle = '#000000';

	this.get = function (y, x) {
		return this.dotArray[y][x];
	};

	this.init = function () {
		this.dotArray = [];
		this.dotArrayFlat = [];

		this.canvas.setAttribute('height', this.gridHeight*5);
		this.canvas.setAttribute('width', this.gridWidth*5);

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
				this.dotArray[y][x].getNeighbors();
				this.dotArray[y][x].draw();
			}
		}
	};

	this.randomize = function () {
		for (let y = 0; y < this.gridHeight; y++) {
			for (let x = 0; x < this.gridWidth; x++) {
				this.get(y, x).alive = Math.round(Math.random());
				this.get(y, x).draw();
			}
		}
	};

	this.doStep = function () {
		//let dot;
		//let gridTmp = this.dotArray.slice();

		let dotsNew = [];
		//let dots = this.dotArrayFlat.slice();

		while (dot = this.dotArrayFlat.pop()) {
			let livingNeighborCount = dot.getLivingNeighborCount();

			if (!dot.alive) {
				if (livingNeighborCount == 3) {
					this.toggleDots.push(dot);
				}
			} else if (livingNeighborCount < 2 || livingNeighborCount > 3) {
				this.toggleDots.push(dot);
			}
			dotsNew.push(dot);
		}

		this.dotArrayFlat = dotsNew;

		while (dot = this.toggleDots.pop()) {
			dot.toggle();
		}
	};

	this.setJson = function (jsonString) {
		let gridTmp = JSON.parse(jsonString);
		let yMax = gridTmp.length > this.gridHeight ? this.gridHeight : gridTmp.length;

		for (y = 0; y < yMax; y++) {
			let xMax = (gridTmp[y].length > this.gridWidth) ? this.gridWidth : gridTmp[y].length;
			for (x = 0; x < xMax; x++) {
				let dot = this.get(y, x);
				dot.alive = gridTmp[y][x];
				dot.draw();
			}
		}
		//this.refresh();
	};

	this.exportJson = function () {
		let simpleGrid = [];
//		for (var y=0; y<this.gridHeight; y++) {
//			simpleGrid[y] = new Array();
//			for (var x=0; x<this.gridWidth; x++) {
//				simpleGrid[y][x] = (this.get(y,x).alive ? 1 : 0);
//			}
//		}

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

		$('importExport').value = JSON.stringify(simpleGrid);
	};

	this.importJson = function () {
		this.setJson($('importExport').value);
	};

	this.changeWidth = function (newWidth) {
		//this.exportJson();
		this.gridWidth = newWidth;
		this.init();
		this.importJson();
	};

	this.changeHeight = function (newHeight) {
		//this.exportJson();
		this.gridHeight = newHeight;
		this.init();
		this.importJson();
	};

	this.changeInterval = function (intervalTime) {
		this.stop();
		this.intervalTime = intervalTime;
		this.start();
	};

	this.start = function () {
		$('start').style.visibility = 'hidden';
		$('stop').style.visibility = 'visible';
		this.interval = window.setInterval("grid.doStep()", this.intervalTime);
	};

	this.stop = function () {
		$('start').style.visibility = 'visible';
		$('stop').style.visibility = 'hidden';
		window.clearInterval(this.interval);
		//this.exportJson();
	}
}


function Dot(x, y, grid) {

	// x + y in grid
	this.x = x;
	this.y = y;

	// x + y on screen
	this.xPos = x*5;
	this.yPos = y*5;

	this.grid = grid;
	this.alive = false;

	this.getLivingNeighborCount = function () {
		let count = 0, neighbor;
		// let neighbors = this.getNeighbors().slice();
		// while(neighbor = neighbors.pop()) {
		// 	if (neighbor.alive) {
		// 		count++;
		// 	}
		// }
		this.getNeighbors().forEach(function (neighbor) {
			if (neighbor.alive) {
				count++;
			}
		});
		return count;
	};

	this.getNeighbors = function () {
		if (!this.neighbors) {
			this.neighbors = [];
			if ((this.y - 1) >= 0) {
				if ((this.x - 1) >= 0) this.neighbors.push(this.grid.get(this.y - 1, this.x - 1));
				this.neighbors.push(this.grid.get(this.y - 1, this.x));
				if ((this.x + 1) < this.grid.gridWidth) this.neighbors.push(this.grid.get(this.y - 1, this.x + 1));
			}

			if ((this.x - 1) >= 0) this.neighbors.push(this.grid.get(this.y, this.x - 1));
			if ((this.x + 1) < this.grid.gridWidth) this.neighbors.push(this.grid.get(this.y, this.x + 1));

			if ((this.y + 1) < this.grid.gridHeight) {
				if ((this.x - 1) >= 0) this.neighbors.push(this.grid.get(this.y + 1, this.x - 1));
				this.neighbors.push(this.grid.get(this.y + 1, this.x));
				if ((this.x + 1) < this.grid.gridWidth) this.neighbors.push(this.grid.get(this.y + 1, this.x + 1));
			}
		}
		return this.neighbors;
	};

	this.toggle = function () {
		this.alive = !this.alive;
		this.draw();
	};

	this.draw = function () {
		this.alive ?
			this.grid.context2D.fillRect(this.xPos, this.yPos, 4, 4) :
			this.grid.context2D.clearRect(this.xPos, this.yPos, 4, 4);
	}

}