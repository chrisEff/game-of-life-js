'use strict'

import Game from './Game.js'
import Grid from './Grid.js'

const $ = (id) => document.getElementById(id)

const isJSON = (string) => {
	try {
		JSON.parse(string)
		return true
	} catch (e) {
		return false
	}
}

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
		el => el.onclick = event => game.loadPattern(
			event.target.innerHTML,
			$('resetBeforeLoad').checked,
			parseInt($('offsetX').value),
			parseInt($('offsetY').value),
		),
	)

	$('gridWidth').onchange    = (event) => game.setWidth(event.target.value)
	$('gridHeight').onchange   = (event) => game.setHeight(event.target.value)
	$('cellSize').onchange     = (event) => game.setCellSize(event.target.value)
	$('intervalTime').onchange = (event) => game.changeIntervalTime(event.target.value)

	$('import').onclick = () => {
		const data = $('importExport').value
		if (isJSON(data)) {
			grid.importJson(data)
		} else {
			grid.importRLE(data)
		}
		game.drawFullFrame()
	}
	$('exportJSON').onclick = () => $('importExport').value = grid.exportJson()
	$('exportRLE').onclick = () => $('importExport').value = grid.exportRLE()

	document.addEventListener('keydown', (event) => {
		if (!event.metaKey && !event.ctrlKey && event.target.tagName.toLowerCase() === 'body' && Object.prototype.hasOwnProperty.call(keymap, event.key)) {
			keymap[event.key]()
			event.preventDefault()
		}
	})
})
