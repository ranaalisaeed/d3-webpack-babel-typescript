import { csv } from 'd3-fetch'

console.log('success from index.js')


function component() {
	const element = document.createElement('div')
	element.innerHTML = 'Hello there'
	return element
}

document.body.appendChild(component())


csv('/data/output.csv').then(function(data) { 
	console.log('csv', data)
})