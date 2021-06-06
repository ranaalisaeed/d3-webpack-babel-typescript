// import * as d3 from 'd3'
import {Selection, ContainerElement, select, pointer} from 'd3-selection'
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear, scaleOrdinal, ScaleOrdinal } from 'd3-scale'
import { schemeSet3 } from 'd3-scale-chromatic'
import { Axis, axisBottom, AxisDomain, axisLeft, AxisScale } from 'd3-axis'
import { stack, stackOffsetNone, stackOrderNone } from 'd3-shape'
import { color } from 'd3-color'
import { dispatch } from 'd3-dispatch'
import { max, sum } from 'd3-array'
import 'd3-transition'

type AtleastOneOf<T> = { [K in keyof T]: Pick<T, K> }[keyof T]
type StackbarDatum = {
    YearQtr: string
} & AtleastOneOf<{
    House: number
    Unit: number
    Land: number
}>

// ES6 module syntax
export default function stackbar(): any {

	let data: StackbarDatum[],
			maxValue: number, // maxValue could be set from API
			dataLayout: any

	let svg: Selection<any, any, any, any>, 
			tooltip: Selection<any, any, any, any>,
			mergedLayers: Selection<any, any, any, any>,
			mouseX: number, mouseY: number
	
	let margin = { top: 20, right: 20, bottom: 60, left: 60 },
			width = 800 - margin.left - margin.right, 
			height = 600 - margin.top - margin.bottom,
			xScMkr: ScaleBand<string>, 
			yScMkr: ScaleLinear<number, number, never>, 
			colorScMkr: ScaleOrdinal<string, string, unknown>,
			xAxisMkr: Axis<AxisDomain>, 
			yAxisMkr: Axis<AxisDomain>

	const tspeed = 1000
	const dispatcher = dispatch('customMouseOver', 'customMouseMove', 'customMouseOut', 'customMouseClick')


	function _(selection: Selection<any, any, any, any>): void {
		selection.each(function(_data: StackbarDatum[]) {

			data = _data // data property as it's needed by API

			buildSVG(this)
			buildScales(data)

			drawAxes()
			buildLayout(data)
			drawStackedBar(data)

			buildTooltip(this) // g element based tooltip can't be appended to SVG, it should be appended to div container
			addMouseEvents() // tooltip should be built before this

			drawLegend(data)
			
		})
	}


	function buildSVG(container: ContainerElement): void {
		if(!svg) {
			svg = select(container)
				.append('svg')
					.classed('vizintel stackbar', true)
			
			buildContainerGroups(svg)
		}
		svg
			.attr('width', width + margin.left + margin.right) // https://bl.ocks.org/mbostock/3019563/0a647e163b8e86eb043621fe1208c81396dea407
			.attr('height', height + margin.top + margin.bottom)
	}


	function buildContainerGroups(svg: Selection<any, any, any, any>) {
		let container: Selection<any, any, any, any> = svg
			.append('g')
			.classed('container-group', true)
			.attr('transform', `translate(${ margin.left }, ${ margin.top })`)

		container
			.append('g').classed('x-axis-group axis', true)
		container
			.append('g').classed('y-axis-group axis', true)
		container
			.append('g').classed('grid-lines-group', true)
		container
			.append('g').classed('chart-group', true)
		container
			.append('g').classed('legend-group', true)
	}


	function getNameLabel(data: StackbarDatum[]): string {
		return Array.from(
			new Set(data
				.map(d => Object.keys(d))
				.reduce((acc, val) => acc.concat(val), []) // alternative .flat()
			)
		)[0]
	}


	// function getCategories(data: StackbarDatum[]): string[] {
	// 	return Array.from(new Set(data
	// 		.map(d => Object.keys(d))
	// 		.reduce((acc, val) => acc.concat(val), []) // alternative .flat()
	// 	)).slice(1)
	// }


	function getMaxValue(data: StackbarDatum[]): number {
		let categories = _.getCategories(data)

		const transformedData: number[] = data.map(d => {
			return max([ sum( 
				categories.map( k => (+d[k as keyof StackbarDatum] as number) )
			) ]) as number;
		})
		return max(transformedData) as number;
	}

	/**
	 * Set the Scale Maker factories as properties
	 * @param data StackbarDatum[]
	 */
	function buildScales(data: StackbarDatum[]): void {
		let categories = _.getCategories(data)
		let computedMaxValue = getMaxValue(data)

		xScMkr = scaleBand()
			.domain(data.map(d => d[getNameLabel(data) as keyof StackbarDatum] as string))
			.rangeRound([0, width]) // https://bl.ocks.org/mbostock/3019563/0a647e163b8e86eb043621fe1208c81396dea407
			.padding(0.1)

		yScMkr = scaleLinear<number>()
			.domain([0, (maxValue && maxValue > computedMaxValue) ? maxValue : computedMaxValue])
			.rangeRound([height, 0]) // https://bl.ocks.org/mbostock/3019563/0a647e163b8e86eb043621fe1208c81396dea407
			.nice()

		colorScMkr = scaleOrdinal(schemeSet3) // github.com/d3/d3-scale-chromatic
			.domain(categories)
			.unknown('#ccc')
	
		buildAxes(xScMkr as AxisScale<AxisDomain>, yScMkr as AxisScale<AxisDomain>)
	}

	
	/**
	 * Set the Axis Maker factories as properties
	 * @param xScMkr 
	 * @param yScMkr 
	 */
	function buildAxes(xScMkr: AxisScale<AxisDomain>, yScMkr: AxisScale<AxisDomain>): void {
		xAxisMkr = axisBottom(xScMkr)
		yAxisMkr = axisLeft(yScMkr)
			// .ticks()
	}


	function drawAxes(): void {

		let xAxis = svg.select('.x-axis-group.axis')

		xAxis
			.attr('transform', `translate( 0, ${ height })`)
			// .transition().duration(tspeed)
			.call(xAxisMkr as any)
		
		xAxis.selectAll('text')
				// .attr('x', 9)
				// .attr('y', -5)
				.attr('dx', '9')
				.attr('dy', '-6')
				.attr('transform', 'rotate(90)')
				.style('text-anchor', 'start')

		let yAxis = svg.select('.y-axis-group.axis')
		
		yAxis
			.attr('transform', `translate(0, 0)`)
			.transition().duration(tspeed)
			.call(yAxisMkr as any)

	}


	/**
	 * 
	 * @param data 
	 */
	function buildLayout(data: StackbarDatum[]): void {
		let categories = _.getCategories(data)

		let stackMkr = stack<StackbarDatum[]>()
			.keys(categories)
			.value((d:any, key:string) => d[key] ? d[key] : 0)
			.order(stackOrderNone)
			.offset(stackOffsetNone)

		dataLayout = stackMkr(data as any)
		// console.log('dataLayout', dataLayout)
	}

	function drawStackedBar(data: StackbarDatum[]): void {


		let chartGroup = select('.chart-group')

		let existingLayers = chartGroup.selectAll('.layer')
			.data(dataLayout)
		
		let appendedLayers: any = existingLayers
			.enter().append('g')
				.classed('layer', true)
		
		mergedLayers = existingLayers.merge(appendedLayers)

		mergedLayers.exit().remove()
		mergedLayers.selectAll('*').remove()
		
		mergedLayers
			.attr('fill', (d: any) => colorScMkr(d.key) as string)
			.attr('stroke', 'white')

		let existingBars = mergedLayers.selectAll('.bar')
			.data((d:any) => d)
	
		let appendedBars:any = existingBars
			.enter().append('g')
				.classed('bar', true)

		let mergedBars = existingBars.merge(appendedBars)

		mergedBars.exit().remove()
		mergedBars.selectAll('*').remove()

		mergedBars
			.append('rect')
			.attr('x', (d: any) => xScMkr(d.data[getNameLabel(data)]) as number)
			.attr('y', (d: any) => yScMkr(0))
			.attr('width', xScMkr.bandwidth())
			.attr('height', (d: any) => yScMkr(d[0]) - yScMkr(0))
			.transition().duration(tspeed)
			.attr('y', (d: any) => yScMkr(d[1]))
			.attr('height', (d: any) => yScMkr(d[0]) - yScMkr(d[1]))
			
	}


	function buildTooltip(container: ContainerElement): void {
		
		tooltip = select(container)
			.append('div')
				.attr('class', 'tooltip')
				.attr('id', 'tooltip')

		tooltip
			// Behaviour
			.style("position", "absolute") // relative to container DIV otherwise heading or any other div will effect
			.style('pointer-events', 'none')
			// Box appearance
			.style("opacity", 0)
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "1px")
			.style("border-radius", "5px")
			.style('border-color', 'lightgrey')
			// Font & box sizing
			.style("padding", "5px")
			.style('font', '11px sans-serif')
			.style('color', 'darkgrey')
	}


	function addMouseEvents(): void {
		svg.selectAll('.bar')
		// mergedBars
		//Interactivity code - step 2 of 4
		/**
		 * @todo: Figure out why this code is very slow
		 * Fixed, need to get color from parent node and apply to target node
		 */
			.on('mouseover', (event) => {
				let evtTgt = event.currentTarget
				evtTgt.setAttribute('fill', color(evtTgt.parentNode.getAttribute('fill'))!.darker())
				// tooltip.style('display', null)
				tooltip.style('opacity', 0.8)	
			})
			.on('mouseout', (event) => {
				let evtTgt = event.currentTarget
				evtTgt.setAttribute('fill', color(evtTgt.parentNode.getAttribute('fill')))
				// tooltip.style('display', 'none')
				tooltip.style('opacity', 0)
			})
			.on('mousemove', (event, d:any) => {
				[mouseX, mouseY] = pointer(event, svg)

				tooltip
					.html(`Value: ${d[1] - d[0]}`) // use the d in (event, d), do not use callback accessor d here.
					.style("left", `${mouseX+10}px`)
					.style("top", `${mouseY}px`)
			})
	
		// svg.selectAll('.bar')
		// mergedBars
		mergedLayers
			.on('mouseover', handleMouseOver )
			.on('mousemove', handleMouseMove )
			.on('mouseout', handleMouseOut )
			.on('mouseclick', handleMouseClick )
			// .on('mouseover', (event, d) => {
			// 	dispatcher.call('customMouseOver', event, d, d3.pointer(event), {name: 'ali'})
			// })
	}

	function handleMouseOver(this:any, event: Event, d: StackbarDatum) {
		dispatcher.call('customMouseOver', event, d, 
			{source: 'vizintel', d: d, event: event, evtCurrTgt: event.currentTarget, this: this, d3Ptr: pointer(event)})
	}

	function handleMouseMove(this:any, event: Event, d: StackbarDatum) {
		dispatcher.call('customMouseMove', event, d, 
			{source: 'vizintel', d: d, event: event, evtCurrTgt: event.currentTarget, this: this, d3Ptr: pointer(event)})
	}

	function handleMouseOut(this:any, event: Event, d: StackbarDatum) {
		dispatcher.call('customMouseOut', event, d, 
			{source: 'vizintel', d: d, event: event, evtCurrTgt: event.currentTarget, this: this, d3Ptr: pointer(event)})
	}

	function handleMouseClick(this:any, event: Event, d: StackbarDatum) {
		dispatcher.call('customMouseClick', event, d, 
			{source: 'vizintel', d: d, event: event, evtCurrTgt: event.currentTarget, this: this, d3Ptr: pointer(event)})
	}


	function drawLegend(data: StackbarDatum[]): void {
		let legendGroup: any = svg.select('.legend-group')

		let existingElems = legendGroup.selectAll('.key-group')
			.data(_.getCategories(data), (d: any) => d)

		let appendedElems = existingElems
			.enter().append('g')
				.classed('key-group', true)

		let mergedElems = existingElems.merge(appendedElems)
		
		mergedElems.exit().remove()

		mergedElems.selectAll('*').remove()

		mergedElems.append('circle')
			.attr('cx', 20)
			.attr('cy', (d: any, i: number) => i * 20 )
			.attr('r', 7)
			.attr('fill', (d: any) => colorScMkr(d))

		mergedElems.append('text')
			.attr('x', 35)
			.attr('y', (d: any, i: number) => i * 20 )
			// .attr('fill', d => colorScMkr(d))
			.attr('text-anchor', 'start')
			// .attr('alignment-baseline', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('vertical-align', 'middle')
			.attr('font-family', 'sans-serif')
			.attr('font-size', '12px')
			.text((d: any) => d)

	}



		// API

	// Interactivity code - step 3 of 4
	_.on = function(...args: any) {
		let value = dispatcher.on.apply(dispatcher, args)

		return value === dispatcher ? _ : value
	}

	_.margin = function(_x: object) {
    if (!arguments.length) { return margin; }
    margin = { ...margin, ..._x }
    return this
  }

	_.maxValue = function(_x: number) {
    if (!arguments.length) { return getMaxValue(data ? data : []); }

    // maxValue = getMaxValue(data ? data : _d) > _x ? getMaxValue(data ? data : _d) : _x

		maxValue = data ? getMaxValue(data) > _x ? getMaxValue(data) : _x : _x

    return this
  }

	_.getCategories = function(data: StackbarDatum[]): string[] {
		return Array.from(new Set(data
			.map(d => Object.keys(d))
			.reduce((acc, val) => acc.concat(val), []) // alternative .flat()
		)).slice(1)
	}


	return _
}