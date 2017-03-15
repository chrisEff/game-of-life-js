function $(id) {
	return document.getElementById(id);
}

function Grid(gridWidth, gridHeight, intervalTime) {
	this.gridWidth = gridWidth;
	this.gridHeight = gridHeight;
	this.intervalTime = intervalTime;

	this.dotArray = [];
	this.toggleDots = [];
	this.interval = null;

	this.get = function (y, x) {
		return this.dotArray[y][x];
	};

	this.init = function () {
		$('foo').innerHTML = '';
		$('gridHeight').value = this.gridHeight;
		$('gridWidth').value = this.gridWidth;
		for (let y = 0; y < this.gridHeight; y++) {
			this.dotArray[y] = [];
			for (let x = 0; x < this.gridWidth; x++) {
				this.dotArray[y][x] = new Dot(x, y, this);
			}
		}
		this.draw();
		//this.exportJson();
	};

	this.draw = function () {
		for (let y = 0; y < this.gridHeight; y++) {
			let row = document.createElement('div');
			row.setAttribute('class', 'row');

			for (let x = 0; x < this.gridWidth; x++) {
				let dot = document.createElement('div');
				dot.setAttribute('id', 'x' + x + 'y' + y);
				dot.setAttribute('class', (this.get(y, x).alive ? 'dot active' : 'dot'));
				dot.setAttribute('onclick', "grid.get(" + y + "," + x + ").toggle();grid.exportJson();");
				dot.setAttribute('title', x + ',' + y);
				row.appendChild(dot);
				this.get(y, x).element = dot;
			}

			$('foo').appendChild(row);
		}
	};

	this.randomize = function () {
		for (let y = 0; y < this.gridHeight; y++) {
			for (let x = 0; x < this.gridWidth; x++) {
				this.get(y, x).alive = Math.round(Math.random());
			}
		}
		this.refresh();
	};

	this.doStep = function () {
		let row, dot;
		let gridTmp = this.dotArray.slice();

		while (row = gridTmp.pop()) {
			row = row.slice();
			while (dot = row.pop()) {
				let livingNeighborCount = dot.getLivingNeighborCount();

				if (!dot.alive) {
					if (livingNeighborCount == 3) {
						this.toggleDots.push(dot);
					}
				} else if (livingNeighborCount < 2 || livingNeighborCount > 3) {
					this.toggleDots.push(dot);
				}
			}
		}

		while (dot = this.toggleDots.pop()) {
			dot.toggle();
		}
	};

	this.refresh = function () {
		let gridTmp = this.dotArray.slice();
		let row, dot;
		while (row = gridTmp.pop()) {
			row = row.slice();
			while (dot = row.pop()) {
				dot.element.setAttribute('class', ((dot.alive) ? 'dot active' : 'dot'));
			}
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
				dot.element.setAttribute('class', ((dot.alive) ? 'dot active' : 'dot'));
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
		this.exportJson();
		this.gridWidth = newWidth;
		this.init();
		this.importJson();
	};

	this.changeHeight = function (newHeight) {
		this.exportJson();
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
		this.exportJson();
	}
}


function Dot(x, y, grid) {
	this.x = x;
	this.y = y;
	this.grid = grid;
	this.alive = 0;
	this.element = null;

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
		this.element.setAttribute('class', ((this.alive) ? 'dot active' : 'dot'));
	};

}