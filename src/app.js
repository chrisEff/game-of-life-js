'use strict'

import Game from './Game.js'
import Grid from './Grid.js'

const $ = (id) => document.getElementById(id)

document.addEventListener('DOMContentLoaded', (event) => {
	const grid = new Grid()

	const game = new Game(
		grid,
		$('canvas'),
		parseInt(window.localStorage.gridWidth) || 128,
		parseInt(window.localStorage.gridHeight) || 128,
		parseInt(window.localStorage.intervalTime) || 1,
		parseInt(window.localStorage.cellSize) || 4,
	)
	game.init()

	$('gridHeight').value = game.height
	$('gridWidth').value = game.width
	$('cellSize').value = game.cellSize
	$('intervalTime').value = game.intervalTime

	const keymap = {
		s:          () => game.interval ? game.stop() : game.start(),
		t:          $('step').onclick      = game.doStep,
		r:          $('reset').onclick     = game.reset,
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
			game.doStep()
		}
		console.log(`Executing ${steps} steps took ${performance.now() - startTime}ms.`)
	}

	Array.from(document.getElementsByClassName('pattern')).forEach(
		el => el.onclick = event => game.loadPattern(event.srcElement.innerHTML),
	)

	$('gridWidth').onchange    = (event) => game.setWidth(event.srcElement.value)
	$('gridHeight').onchange   = (event) => game.setHeight(event.srcElement.value)
	$('cellSize').onchange     = (event) => game.setCellSize(event.srcElement.value)
	$('intervalTime').onchange = (event) => game.changeIntervalTime(event.srcElement.value)

	$('import').onclick = () => {
		grid.importJson($('importExport').value)
		game.drawFullFrame()
	}
	$('export').onclick = () => $('importExport').value = grid.exportJson()

	document.addEventListener('keydown', (event) => {
		if (event.target.tagName.toLowerCase() === 'body' && Object.prototype.hasOwnProperty.call(keymap, event.key)) {
			keymap[event.key]()
			event.preventDefault()
		}
	})
})
