import { select } from 'd3-selection'
import stackbar from '../charts/stackbar'
import { addComponent } from '../helpers'

let heading = document.createElement('h3')
heading.textContent = "Stackbar Demo"
document.body.appendChild(heading)
document.body.appendChild(addComponent({
	className: 'stackbar-container'
}))


let randomInt = () => Math.random() * 1000
const data = [
  { YearQtr: '2000Q1', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2000Q2', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2000Q3', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2000Q4', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2001Q1', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2001Q2', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2001Q3', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2001Q4', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2002Q1', House: randomInt(), Unit: randomInt(), Land: randomInt() },
  { YearQtr: '2002Q2', House: randomInt(), Unit: randomInt(), Land: randomInt() },
]

// console.log('test')
const container = select('.stackbar-container')
const stackbarChart = stackbar()

container.datum(data).call(stackbarChart)
