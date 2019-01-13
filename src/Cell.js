'use strict'
import autoBind from './autoBind.js'

export default class Cell {

	/**
	 * @param {int} x
	 * @param {int} y
	 * @param {Grid} grid
	 */
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
				const neighbor = this.grid.get(coords.y, coords.x)
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

}
