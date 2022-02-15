/**
 * @property {int} xPos
 * @property {int} yPos
 * @property {boolean} alive
 * @property {Cell[]} neighbors
 * @property {int} livingNeighborCount
 */
export default class Cell {
	/**
	 * @param {int} x
	 * @param {int} y
	 * @param {int} cellSize
	 */
	constructor(x, y, cellSize) {
		// x + y on screen
		this.xPos = x * (cellSize + 1)
		this.yPos = y * (cellSize + 1)

		this.alive = false
		this.livingNeighborCount = 0
	}

	setNeighbors(neighbors) {
		this.neighbors = neighbors
	}

	/**
	 * @param {boolean} alive
	 */
	setAlive(alive) {
		if (this.alive === alive) {
			return
		}
		this.toggle()
	}

	toggle() {
		this.alive = !this.alive
		this.alive
			? this.neighbors.forEach(neighbor => neighbor.livingNeighborCount++)
			: this.neighbors.forEach(neighbor => neighbor.livingNeighborCount--)
	}
}
