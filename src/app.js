'use strict'

import Game from './Game.js'
import Grid from './Grid.js'

const $ = (id) => document.getElementById(id)

document.addEventListener('DOMContentLoaded', (event) => {
	const canvas = $('canvas')
	canvas.getContext('2d').fillStyle = '#000000'

	const grid = new Grid(
		canvas,
		parseInt(window.localStorage.gridWidth) || 128,
		parseInt(window.localStorage.gridHeight) || 128,
		parseInt(window.localStorage.cellSize) || 4
	)
	grid.init()

	const game = new Game(
		grid,
		canvas,
		parseInt(window.localStorage.intervalTime) || 1
	)

	$('gridHeight').value = grid.height
	$('gridWidth').value = grid.width
	$('cellSize').value = grid.cellSize
	$('intervalTime').value = game.intervalTime

	const keymap = {
		s: () => game.interval ? game.stop() : game.start(),
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

	$('start').onclick     = game.start
	$('stop').onclick      = game.stop
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

	$('gridWidth').onchange    = (event) => game.setWidth(event.srcElement.value)
	$('gridHeight').onchange   = (event) => game.setHeight(event.srcElement.value)
	$('cellSize').onchange     = (event) => game.setCellSize(event.srcElement.value)
	$('intervalTime').onchange = (event) => game.changeIntervalTime(event.srcElement.value)

	$('import').onclick = () => grid.importJson($('importExport').value)
	$('export').onclick = () => $('importExport').value = grid.exportJson($('importExport'))

	document.addEventListener('keydown', (event) => {
		if (event.srcElement.tagName.toLowerCase() === 'body' && keymap.hasOwnProperty(event.key)) {
			keymap[event.key]()
			event.preventDefault()
		}
	})

	canvas.onclick = (event) => {
		const cell = grid.get(Math.floor(event.offsetY / (grid.cellSize + 1)), Math.floor(event.offsetX / (grid.cellSize + 1)))
		cell.setAlive(!cell.alive)
		grid.drawCell(cell)
	}
})
