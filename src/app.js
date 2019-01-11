'use strict'

import Grid from './Grid.js'

const $ = (id) => document.getElementById(id)

document.addEventListener('DOMContentLoaded', (event) => {
	const grid = new Grid(
		$('canvas'),
		window.localStorage.gridWidth || 128,
		window.localStorage.gridHeight || 128,
		window.localStorage.cellSize || 4,
		window.localStorage.intervalTime || 1
	)
	grid.init()

	$('gridHeight').value = grid.gridHeight
	$('gridWidth').value = grid.gridWidth
	$('cellSize').value = grid.cellSize
	$('intervalTime').value = grid.intervalTime

	const keymap = {
		s: grid.startStop,
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

	$('start').onclick = () => {
		$('start').style.display = 'none'
		$('stop').style.display = 'initial'
		grid.start()
	}
	$('stop').onclick = () => {
		$('start').style.display = 'initial'
		$('stop').style.display = 'none'
		grid.stop()
	}
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

	$('gridWidth').onchange    = (event) => grid.changeWidth(event.srcElement.value)
	$('gridHeight').onchange   = (event) => grid.changeHeight(event.srcElement.value)
	$('cellSize').onchange     = (event) => grid.changeCellSize(event.srcElement.value)
	$('intervalTime').onchange = (event) => grid.changeIntervalTime(event.srcElement.value)

	$('import').onclick = () => grid.importJson($('importExport'))
	$('export').onclick = () => grid.exportJson($('importExport'))

	document.addEventListener('keydown', (event) => {
		if (event.srcElement.tagName.toLowerCase() === 'body' && keymap.hasOwnProperty(event.key)) {
			keymap[event.key]()
			event.preventDefault()
		}
	})
})


