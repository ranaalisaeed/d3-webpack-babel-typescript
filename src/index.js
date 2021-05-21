import * as d3Fetch from 'd3-fetch'

console.log('success from index.js')


function component() {
	const element = document.createElement('div')
	element.innerHTML = 'Hello there'
	return element
}

document.body.appendChild(component())


d3Fetch.csv('/data/output.csv').then(function(data) { 
	console.log('csv', data)
})