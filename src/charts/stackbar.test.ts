/**
 * @jest-environment jsdom
 */

import stackbar from './stackbar'
import { select } from 'd3-selection';
import { max, sum } from 'd3-array';

// https://stackoverflow.com/a/3627747/1718983
function rgb2hex(rgb) {
	if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	function hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
	}
	return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

const randomInt = () => Math.random() * 1000

// Take away some values (add missing values) so stackMkr.value((d, key) => d[key] ? d[key] : 0) is tested
const sample_data = [
  { YearQtr: '2000Q1', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2000Q2', /* House: randomInt(), */ Unit: randomInt(), /* Land: randomInt() */ },
  { YearQtr: '2000Q3', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2000Q4', House: randomInt(), /* Unit: randomInt(), */ Land: randomInt() },
  { YearQtr: '2001Q1', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2001Q2', /* House: randomInt(), */ Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2001Q3', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2001Q4', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2002Q1', House: randomInt(), Unit: randomInt(), /* Land: randomInt() */ },
  { YearQtr: '2002Q2', House: randomInt(), Unit: randomInt(), Land: randomInt() },
]
const sample_categories = 3
const sample_data_entries = sample_data.length

describe('Stackbar Chart', () => {
	let stackbarChart;
	let container;

	beforeEach(() => {
		const fixture = '<div id="fixture"><div class="container"></div></div>'

		document.body.insertAdjacentHTML('afterbegin', fixture)
	})

	afterEach(() => {
		document.body.removeChild(document.getElementById('fixture'));
	})

	describe('Render', () => {

		beforeEach(() => {
			stackbarChart = stackbar()
			container = select('.container')
			container.datum(sample_data).call(stackbarChart)
		})

		afterEach(() => {
			container.remove()
		})

		test('should render an svg with class attr', () => {
			const expected = 1
			const actual = container.select('.stackbar').size()
			expect(actual).toBe(expected)
		})

		test.skip('should update svg width/height if svg already exists', () => {
		})

		describe('groups', () => {
			test('should create a container-group', () => {
				const expected = 1;
				const actual = container.select('g.container-group').size()
				expect(actual).toBe(expected)
			})

			test('should create a chart-group', () => {
				const expected = 1;
				const actual = container.select('g.chart-group').size()
				expect(actual).toBe(expected)
			})

			test.skip('should create a tooltip-group', () => {
				const expected = 1;
				const actual = container.select('g.tooltip-group').size()
				expect(actual).toBe(expected)
			})

			test('should create a x-axis-group', () => {
				const expected = 1;
				const actual = container.select('g.x-axis-group').size()
				expect(actual).toBe(expected)
			})

			test('should create a y-axis-group', () => {
				const expected = 1;
				const actual = container.select('g.y-axis-group').size()
				expect(actual).toBe(expected)
			})

			test('should create a grid-lines-group', () => {
				const expected = 1;
				const actual = container.select('g.grid-lines-group').size()
				expect(actual).toBe(expected)
			})

			test.skip('should create groups in correct order', () => {})

		})

		describe('axis', () => {
			test('should draw an X axis', () => {
				const expected = 1
				const actual = container.select('.x-axis-group.axis').size()
				expect(actual).toBe(expected)
			})

			test('should draw a Y axis', () => {
				const expected = 1
				const actual = container.select('.y-axis-group.axis').size()
				expect(actual).toBe(expected)
			})

		})

		describe('data layout', () => {
			test('should have a layer for each category', () => {
				const expected = sample_categories
				const actual = container.selectAll('.layer').size()
				expect(actual).toBe(expected)
			})

			test('should have a bar for each data entry within layer', () => {
				const expected = sample_data_entries
				const actual = container.select('.layer').selectAll('.bar').size()
				expect(actual).toBe(expected)
			})	
		})

	})

	describe('Lifecycle', () => {
		beforeEach(() => {
			stackbarChart = stackbar()
			container = select('.container')
			container.datum(sample_data).call(stackbarChart)
		})

		afterEach(() => {
			container.remove()
		})

		describe('when hovering over a bar', () => {
			// const sandbox = sinon.createSandbox()
			var aBar, aRect, aLayer

			beforeEach(() => {
				// aBar = container.selectAll('.bar:nth-child(1)')
				aBar = container.select('.bar')
				aLayer = container.select('.layer')
				aRect = container.select('.bar > rect') // mouse over barsEnter refers rect as this
			})

			// afterEach(() => sandbox.restore())

			test('should trigger a callback on mouse over', () => {
				const expected = 1

				// const spy = sandbox.spy()
				const spy = jest.fn()
				stackbarChart.on('customMouseOver', spy)

				// aBar.node().dispatchEvent(new MouseEvent('mouseover'))
				aLayer.dispatch('mouseover')

				// var spyCall = spy.getCall(-1)
				// console.log('spyCall', spyCall)
				// console.log('spy.callCount ', spy.callCount)

				// const actual = spy.callCount
				const actual = spy.mock.calls.length
				expect(actual).toBe(expected)

			})

			test('should update color with mouse over', () => {
				const oldColor = rgb2hex(aBar.node().parentNode.getAttribute('fill')); // console.log('oldColor: ', oldColor)

				// aBar.node().dispatchEvent(new MouseEvent('mouseover'))
				aBar.dispatch('mouseover')

				const newColor = rgb2hex(aBar.node().getAttribute('fill')); // console.log('newColor: ', newColor)

				expect(oldColor).not.toBe(newColor)
			})

			test('should trigger a callback with data entry as argument', () => {
				const expected = sample_data[0]; // console.log('expected ', expected)

				// const spy = sandbox.spy()
				const spy = jest.fn()
				stackbarChart.on('customMouseOver', spy)
				aLayer.dispatch('mouseover')

				// const actual = spy.getCall(-1).firstArg[0]; // console.log('sDEBUG spy =======>', spy.getCall(-1).firstArg[0])
				const actual = spy.mock.calls[0][0][0]
				expect(actual).toBe(expected)
			})
		})

		describe('when moving over a bar', () => {

			// const sandbox = sinon.createSandbox()
			var aBar, aRect, aLayer

			beforeEach(() => {
				aBar = container.select('.bar')
				aLayer = container.select('.layer')
				aRect = container.select('.bar > rect') // mouse over barsEnter refers rect as this
			})

			// afterEach(() => sandbox.restore())

			test('should show tooltip on mouseover and hide on mouseout', () => {

				const tooltip = document.getElementById('tooltip')
				const initial = +tooltip.style.opacity // should be zero
				
				aBar.dispatch('mouseover')
				const on_mouseover = +tooltip.style.opacity // should be non-zero or maximum 1

				aBar.dispatch('mouseout')
				const on_mouseout = +tooltip.style.display // should be zero

				expect(initial).toEqual(0)
				expect(on_mouseover).toBeGreaterThan(0)
				expect(on_mouseover).toBeLessThanOrEqual(1)
				expect(on_mouseout).toEqual(0)
			})

			test.skip('should move tooltip on mouse move', () => {

				const tooltip = document.getElementById('tooltip')

				// init state
				let [textContent, top, left] = [tooltip.textContent, tooltip.style.top, tooltip.style.left]
				console.log(textContent, top, left)
				expect(textContent).toMatch("")
				expect(top).toMatch("")
				expect(left).toMatch("")

				aBar.dispatch('mouseover') // transform attribute added
				// console.log(tooltip.getAttribute('transform'))
				aBar.dispatch('mousemove')
				// const tooltip_state = tooltip.getAttribute('transform') // should be non-null
				// console.log(tooltip.getAttribute('transform'))

				[textContent, top, left] = [tooltip.textContent, tooltip.style.top, tooltip.style.left]
				console.log(textContent, top, left)
				expect(textContent).not.toMatch("")
				expect(top).not.toMatch("")
				expect(left).not.toMatch("")


				// expect(initial_state).toBeNull()
				// expect(tooltip_state).not.toBeNull()
			})

			test('should trigger a callback once on mouse move', () => {
				const expected = 1

				// const spy = sandbox.spy()
				const spy = jest.fn()
				stackbarChart.on('customMouseMove', spy)
				aLayer.dispatch('mousemove')

				// const actual = spy.callCount
				const actual = spy.mock.calls.length
				expect(actual).toBe(expected)
			})

			test('should trigger a callback with data entry as argument', () => {
				const expected = sample_data[0]

				// const spy = sandbox.spy()
				const spy = jest.fn()
				stackbarChart.on('customMouseMove', spy)
				aLayer.dispatch('mousemove')

				// const actual = spy.getCall(-1).firstArg[0]; // console.log('sDEBUG spy =======>', spy.getCall(-1).firstArg[0])
				const actual = spy.mock.calls[0][0][0]
				expect(actual).toBe(expected)
			})
		})

		describe('when moving out of a bar', () => {

			// const sandbox = sinon.createSandbox()
			var aBar, aRect, aLayer

			beforeEach(() => {
				aBar = container.select('.bar')
				aLayer = container.select('.layer')
				aRect = container.select('.bar > rect') // mouse over barsEnter refers rect as this
			})

			// afterEach(() => sandbox.restore())

			test('should revert color to original with mouse out', () => {
				const originalColor_pre = rgb2hex(aBar.node().parentNode.getAttribute('fill')); // console.log('originalColor_pre: ', originalColor_pre)

				// aBar.node().dispatchEvent(new MouseEvent('mouseover'))
				aBar.dispatch('mouseover')
				const newColor = rgb2hex(aBar.node().getAttribute('fill')); // console.log('newColor: ', newColor)

				aBar.dispatch('mouseout')
				const originalColor_post = rgb2hex(aBar.node().getAttribute('fill')); //console.log('originalColor_post: ', originalColor_post)

				expect(originalColor_pre).not.toBe(newColor)
				expect(originalColor_pre).toBe(originalColor_post)
			})

			test('should trigger a callback once on mouse out', () => {
				const expected = 1

				// const spy = sandbox.spy()
				const spy = jest.fn()
				stackbarChart.on('customMouseOut', spy)
				aLayer.dispatch('mouseout')

				// const actual = spy.callCount
				const actual = spy.mock.calls.length
				expect(actual).toBe(expected)
			})

			test('should trigger a callback with data entry as argument', () => {
				const expected = sample_data[0]

				// const spy = sandbox.spy()
				const spy = jest.fn()
				stackbarChart.on('customMouseOut', spy)
				aLayer.dispatch('mouseout')

				// const actual = spy.getCall(-1).firstArg[0]; // console.log('sDEBUG spy =======>', spy.getCall(-1).firstArg[0])
				const actual = spy.mock.calls[0][0][0]
				expect(actual).toBe(expected)
			})
		})

		describe('when clicking a bar', () => {

			// const sandbox = sinon.createSandbox()
			var aBar, aRect, aLayer

			beforeEach(() => {
				aBar = container.select('.bar')
				aLayer = container.select('.layer')
				aRect = container.select('.bar > rect') // mouse over barsEnter refers rect as this
			})

			// afterEach(() => sandbox.restore())

			test('should trigger a callback once on mouse click', () => {
				const expected = 1

				// const spy = sandbox.spy()
				const spy = jest.fn()
				stackbarChart.on('customMouseClick', spy)
				aLayer.dispatch('mouseclick')

				// const actual = spy.callCount
				const actual = spy.mock.calls.length
				expect(actual).toBe(expected)
			})

			test('should trigger a callback with data entry as argument', () => {
				const expected = sample_data[0]

				// const spy = sandbox.spy()
				const spy = jest.fn()
				stackbarChart.on('customMouseClick', spy)
				aLayer.dispatch('mouseclick')

				// const actual = spy.getCall(-1).firstArg[0]; // console.log('sDEBUG spy =======>', spy.getCall(-1).firstArg[0])
				const actual = spy.mock.calls[0][0][0]
				expect(actual).toBe(expected)
			})
		})

	})

	describe('API', () => {
		beforeEach(() => {
			stackbarChart = stackbar()
			container = select('.container')
			container.datum(sample_data).call(stackbarChart)
		})

		afterEach(() => {
			container.remove()
		})

		test('should provide maxValue getter and setter', () => {
			const sample_categories = stackbarChart.categories()
			const data_maxVal = max(
				sample_data.map(d => max(
					[sum(sample_categories.map(k => d[k]))]	
				))
			); // console.log('data_maxVal: ', data_maxVal)

			const lesser_maxVal = Math.random() * data_maxVal / 2; // console.log('lesser_maxVal ', lesser_maxVal)
			expect(data_maxVal).toBeGreaterThan(lesser_maxVal)

			stackbarChart.maxValue(lesser_maxVal)
			container.datum(sample_data).call(stackbarChart)
			
			// const actual = document.getElementsByClassName()
			let actual = select('.y-axis-group').selectAll('.tick').nodes().slice(-1).pop().__data__;
			// console.log('actual ', actual)
			expect(actual).toBeGreaterThanOrEqual(data_maxVal)
			

			const higher_maxVal = Math.random() * data_maxVal * 4; // console.log('higher_maxVal ', higher_maxVal)
			expect(data_maxVal).toBeLessThan(higher_maxVal)			
			
			stackbarChart.maxValue(higher_maxVal)
			container.datum(sample_data).call(stackbarChart)

			actual = select('.y-axis-group').selectAll('.tick').nodes().slice(-1).pop().__data__; // console.log('actual ', actual)
			expect(actual).toBeGreaterThanOrEqual(higher_maxVal)


		})

		test('should provide an event "on" getter and setter', () => {
			const callback = () => {}
			const expected = callback

			stackbarChart.on('customMouseClick', callback)
			let actual = stackbarChart.on('customMouseClick')

			expect(actual).toBe(expected)
		})

		describe('margin', () => {
			test('should provide margin getter and setter', () => {
				const previous = stackbarChart.margin()
				const expected = {top: 100, right: 100, bottom: 100, left: 100}

				stackbarChart.margin(expected)
				let actual = stackbarChart.margin()

				expect(previous).not.toEqual(actual)
				expect(actual).toEqual(expected)
			})

			describe('when margins are set partially', () => {
				test('should override the default values', () => {
					const previous = stackbarChart.margin()
					const expected = {...previous, top: 100, right: 200}

					stackbarChart.margin({top: 100, right: 200})
					let actual = stackbarChart.margin()

					expect(previous).not.toEqual(actual)
					expect(actual).toEqual(expected)
				})
			})
		})
	})
})