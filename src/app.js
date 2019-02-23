'use strict'

import Game from './Game.js'
import Grid from './Grid.js'

const $ = (id) => document.getElementById(id)

document.addEventListener('DOMContentLoaded', (event) => {
	const canvas = $('canvas')
	canvas.getContext('2d').fillStyle = '#000000'

	const grid = new Grid(
		parseInt(window.localStorage.gridWidth) || 128,
		parseInt(window.localStorage.gridHeight) || 128,
		parseInt(window.localStorage.cellSize) || 4
	)

	const game = new Game(
		grid,
		canvas,
		parseInt(window.localStorage.intervalTime) || 1
	)
	game.init()

	$('gridHeight').value = grid.height
	$('gridWidth').value = grid.width
	$('cellSize').value = grid.cellSize
	$('intervalTime').value = game.intervalTime

	const keymap = {
		s:          () => game.interval ? game.stop() : game.start(),
		t:          $('step').onclick      = game.doStep,
		r:          $('reset').onclick     = game.init,
		h:          $('hflip').onclick     = () => { grid.hflip(); game.drawFullFrame() },
		v:          $('vflip').onclick     = () => { grid.vflip(); game.drawFullFrame() },
		o:          $('rotate').onclick    = () => { grid.rotate(); game.drawFullFrame() },
		a:          $('randomize').onclick = () => { grid.randomize(); game.drawFullFrame() },
		ArrowDown:  $('down').onclick      = () => { grid.shiftDown(); game.drawFullFrame() },
		ArrowUp:    $('up').onclick        = () => { grid.shiftUp(); game.drawFullFrame() },
		ArrowLeft:  $('left').onclick      = () => { grid.shiftLeft(); game.drawFullFrame() },
		ArrowRight: $('right').onclick     = () => { grid.shiftRight(); game.drawFullFrame() },
	}

	$('start').onclick     = game.start
	$('stop').onclick      = game.stop

	$('runBenchmark').onclick = () => {
		const steps = $('benchmarkSteps').value
		const startTime = performance.now()
		for (let i = 0; i < steps; i++) {
			grid.doStep()
		}
		console.log(`Executing ${steps} steps took ${performance.now() - startTime}ms.`)
	}

	Array.from(document.getElementsByClassName('pattern')).forEach(
		el => el.onclick = event => game.loadPattern(event.srcElement.innerHTML)
	)

	$('gridWidth').onchange    = (event) => game.setWidth(event.srcElement.value)
	$('gridHeight').onchange   = (event) => game.setHeight(event.srcElement.value)
	$('cellSize').onchange     = (event) => game.setCellSize(event.srcElement.value)
	$('intervalTime').onchange = (event) => game.changeIntervalTime(event.srcElement.value)

	$('import').onclick = () => {
		grid.importJson($('importExport').value)
		game.drawFullFrame()
	}
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
		game.drawCell(cell)
	}
})
