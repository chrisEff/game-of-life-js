import Game from './Game.js'
import Grid from './Grid.js'
import LocalStorageHelper from './util/LocalStorageHelper.js'
import isJSON from './util/isJSON.js'
import packageInfo from '../package.json'

const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)

document.addEventListener('DOMContentLoaded', () => {
	const ls = new LocalStorageHelper()
	const displayStates = ls.getJson('displayStates') || {}

	for (const [id, state] of Object.entries(displayStates)) {
		$('#' + id).style.display = state
	}

	HTMLElement.prototype.toggle = function (defaultDisplay = 'initial') {
		this.style.display = ['', 'none'].includes(this.style.display) ? defaultDisplay : 'none'
		ls.setObjectProperty('displayStates', this.id, this.style.display)
	}

	$('#version').innerHTML = 'v' + packageInfo.version

	const grid = new Grid()

	const game = new Game(
		grid,
		$('#canvas'),
		Number.parseInt(window.localStorage.gridWidth) || 128,
		Number.parseInt(window.localStorage.gridHeight) || 128,
		Number.parseInt(window.localStorage.intervalTime) || 1,
		Number.parseInt(window.localStorage.cellSize) || 4,
	)
	game.init()

	$('#gridHeight').value = game.height
	$('#gridWidth').value = game.width
	$('#cellSize').value = game.cellSize
	$('#intervalTime').value = game.intervalTime

	const startGame = () => {
		$('#start').style.display = 'none'
		$('#stop').style.display = 'initial'
		game.start()
	}

	const stopGame = () => {
		$('#start').style.display = 'initial'
		$('#stop').style.display = 'none'
		game.stop()
	}

	// prettier-ignore
	const keymap = {
		s:          () => game.running ? stopGame() : startGame(),
		t:          $('#step').onclick      = game.doStep,
		r:          $('#reset').onclick     = game.reset,
		h:          $('#hflip').onclick     = () => { grid.hflip(); game.drawFullFrame() },
		v:          $('#vflip').onclick     = () => { grid.vflip(); game.drawFullFrame() },
		o:          $('#rotate').onclick    = () => { grid.rotate(); game.drawFullFrame() },
		a:          $('#randomize').onclick = () => { grid.randomize(); game.drawFullFrame() },
		ArrowDown:  $('#down').onclick      = () => { grid.shiftDown(); game.drawFullFrame() },
		ArrowUp:    $('#up').onclick        = () => { grid.shiftUp(); game.drawFullFrame() },
		ArrowLeft:  $('#left').onclick      = () => { grid.shiftLeft(); game.drawFullFrame() },
		ArrowRight: $('#right').onclick     = () => { grid.shiftRight(); game.drawFullFrame() },
	}

	$('#start').onclick = startGame
	$('#stop').onclick = stopGame

	$('#runBenchmark').onclick = () => {
		const steps = $('#benchmarkSteps').value
		const startTime = performance.now()
		for (let i = 0; i < steps; i++) {
			game.doStep()
		}
		console.log(`Executing ${steps} steps took ${performance.now() - startTime}ms.`)
	}

	// prettier-ignore
	for (const el of Array.from($$('.pattern'))) {
		el.onclick = event => {
			event.target.blur()
			return game.loadPattern(
				event.target.value || event.target.innerHTML,
				$('#resetBeforeLoad').checked,
				document.forms.settings.offsetXcenter.value ? -1 : Number.parseInt($('#offsetX').value),
				document.forms.settings.offsetYcenter.value ? -1 : Number.parseInt($('#offsetY').value)
			)
		}
	}

	$('#gridWidth').onchange = event => game.setWidth(event.target.value)
	$('#gridHeight').onchange = event => game.setHeight(event.target.value)
	$('#cellSize').onchange = event => game.setCellSize(event.target.value)
	$('#intervalTime').onchange = event => game.changeIntervalTime(event.target.value)

	$('#numbersLettersLabel').onclick = () => $('#numbersLetters').toggle('block')
	$('#gliderGunsLabel').onclick = () => $('#gliderGuns').toggle('flex')
	$('#corderShipsLabel').onclick = () => $('#corderShips').toggle('flex')
	$('#miscLabel').onclick = () => $('#misc').toggle('flex')

	$('#import').onclick = () => {
		const data = $('#importExport').value
		const offsetX = document.forms.settings.offsetXcenter.value ? -1 : Number.parseInt($('#offsetX').value)
		const offsetY = document.forms.settings.offsetYcenter.value ? -1 : Number.parseInt($('#offsetY').value)

		if ($('#resetBeforeLoad').checked) {
			game.reset()
		}

		if (isJSON(data)) {
			grid.importJson(data, offsetX, offsetY)
		} else {
			grid.importRLE(data, offsetX, offsetY)
		}
		game.drawFullFrame()
	}
	$('#exportJSON').onclick = () => ($('#importExport').value = grid.exportJson())
	$('#exportRLE').onclick = () => ($('#importExport').value = grid.exportRLE())

	document.addEventListener('keydown', event => {
		if (
			!event.metaKey &&
			!event.ctrlKey &&
			event.target.tagName.toLowerCase() === 'body' &&
			Object.prototype.hasOwnProperty.call(keymap, event.key)
		) {
			keymap[event.key]()
			event.preventDefault()
		}
	})
})
