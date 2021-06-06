import { csv } from 'd3-fetch'
import { rollUnroll, addComponent } from './helpers'
import { sum } from 'd3-array'
import { select } from 'd3-selection'
import stackbar from './charts/stackbar';


const mystackbar = stackbar();


document.body.appendChild(addComponent({
	idName: 'menu'
}))
document.body.appendChild(addComponent({
	className: 'container'
}))


csv('/data/output.csv', function (row: any) {
	return {
		YearQtr: row['Year'].concat(row['Quarter']),
		Suburb: row['Suburb'],
		Type: row['Type'],
		NumSales: +row['NumSales'],
		MedianPrice: +row['MedianPrice']
	}
}).then(function (data) {
	console.log('csv', data)
	// data = data.sort(() => Math.random() - Math.random()).slice(0, 1000)

	let sales_by_suburb = rollUnroll(data,
		(v: any) => sum(v, (d: any) => d.NumSales),
		['Suburb', 'YearQtr', 'Type'],
		'NumSales')
	console.log('sales_by_suburb', sales_by_suburb)

	let sales_by_suburb__wide: any[] = Object.values(
		sales_by_suburb.reduce((acc, {
			Suburb,
			YearQtr,
			Type,
			NumSales
		}) => {
			Object.assign(
				(((acc[Suburb] = acc[Suburb] || {})[YearQtr] = acc[Suburb][YearQtr] ||
					{
						Suburb,
						YearQtr
					})), {
					[Type]: NumSales
				}
			)
			return acc
		}, {})
	).flatMap(Object.values as any)


	sales_by_suburb__wide = sales_by_suburb__wide.filter((d: any) => d.House + d.Unit + d.Land > 50)
	console.log('sales_by_suburb__wide', sales_by_suburb__wide)

	let suburbs = [...new Set(sales_by_suburb__wide.map((d: any) => d.Suburb))]
	// console.log(suburbs)

	let suburbMenu = select('#menu').append('select')
	// Add options to Select selection
	suburbMenu.selectAll('option')
		.data(suburbs)
		.enter().append('option')
		.attr('value', (d: any) => d)
		.text((d: any) => String(d).toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))

	mystackbar
		.maxValue(200)
		.on('customMouseOver', function (...args: any[]) {
			console.log(args)
		})

	suburbMenu.on('change', function (this: any) {
		let suburbData = sales_by_suburb__wide.filter((d: any) => d.Suburb == this.value);
		console.log(suburbData)
		select('.container')
			.datum(suburbData.map(({
				Suburb,
				...data
			}) => data))
			.call(mystackbar)
	})
})