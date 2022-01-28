import chai from 'chai'
import Grid from '../src/Grid.js'

describe('Grid', () => {
	/** @type Grid */
	let grid

	const sampleData = [
		[1, 0, 0],
		[1, 0, 0],
		[0, 0, 1],
	]

	beforeEach(() => {
		grid = new Grid()
		grid.init(3, 3, 1)
	})

	describe('reset', () => {
		it('should set all cells to "dead"', () => {
			grid.importGrid(sampleData)
			grid.reset()
			chai.assert.deepStrictEqual(grid.exportGrid(), [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			])
		})
	})

	describe('doStep', () => {
		it('should determine which cells to toggle', () => {
			grid = new Grid()
			grid.init(5, 5, 1)

			grid.importGrid([
				[0, 0, 0, 0, 0],
				[0, 0, 1, 0, 0],
				[0, 1, 1, 1, 0],
				[0, 0, 1, 0, 0],
				[0, 0, 0, 0, 0],
			])

			let cells = grid.doStep()
			cells.forEach(cell => cell.toggle())

			chai.assert.deepStrictEqual(grid.exportGrid(), [
				[0, 0, 0, 0, 0],
				[0, 1, 1, 1, 0],
				[0, 1, 0, 1, 0],
				[0, 1, 1, 1, 0],
				[0, 0, 0, 0, 0],
			])

			cells = grid.doStep()
			cells.forEach(cell => cell.toggle())

			chai.assert.deepStrictEqual(grid.exportGrid(), [
				[0, 0, 1, 0, 0],
				[0, 1, 0, 1, 0],
				[1, 0, 0, 0, 1],
				[0, 1, 0, 1, 0],
				[0, 0, 1, 0, 0],
			])
		})
	})

	describe('importRLE', () => {
		it('should import data in RLE format', () => {
			grid.importRLE('1o$1o$2b1o')
			chai.assert.deepStrictEqual(grid.exportGrid(), sampleData)
		})
	})

	describe('exportRLE', () => {
		it('should export the grid in RLE format', () => {
			grid.importGrid(sampleData)
			chai.assert.deepStrictEqual(grid.exportRLE(), '1o$1o$2b1o')
		})
	})

	describe('hflip', () => {
		it('should flip the grid horizontally', () => {
			grid.importGrid(sampleData)
			grid.hflip()
			chai.assert.deepStrictEqual(grid.exportGrid(), [
				[0, 0, 1],
				[0, 0, 1],
				[1, 0, 0],
			])
		})
	})

	describe('vflip', () => {
		it('should flip the grid vertically', () => {
			grid.importGrid(sampleData)
			grid.vflip()
			chai.assert.deepStrictEqual(grid.exportGrid(), [
				[0, 0, 1],
				[1, 0, 0],
				[1, 0, 0],
			])
		})
	})

	describe('shiftUp', () => {
		it('should shift the grid up by 1 row', () => {
			grid.importGrid(sampleData)
			grid.shiftUp()
			chai.assert.deepStrictEqual(grid.exportGrid(), [
				[1, 0, 0],
				[0, 0, 1],
				[0, 0, 0],
			])
		})
	})

	describe('shiftDown', () => {
		it('should shift the grid down by 1 row', () => {
			grid.importGrid(sampleData)
			grid.shiftDown()
			chai.assert.deepStrictEqual(grid.exportGrid(), [
				[0, 0, 0],
				[1, 0, 0],
				[1, 0, 0],
			])
		})
	})

	describe('shiftLeft', () => {
		it('should shift the grid left by 1 column', () => {
			grid.importGrid(sampleData)
			grid.shiftLeft()
			chai.assert.deepStrictEqual(grid.exportGrid(), [
				[0, 0, 0],
				[0, 0, 0],
				[0, 1, 0],
			])
		})
	})

	describe('shiftRight', () => {
		it('should shift the grid right by 1 column', () => {
			grid.importGrid(sampleData)
			grid.shiftRight()
			chai.assert.deepStrictEqual(grid.exportGrid(), [
				[0, 1, 0],
				[0, 1, 0],
				[0, 0, 0],
			])
		})
	})
})
