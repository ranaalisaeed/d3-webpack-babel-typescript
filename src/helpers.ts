import { rollup } from "d3-array";


function unroll(rollup: any, keys: any, label = "value", p = {}): any[] {
	return Array.from(rollup, ([key, value]) => 
		value instanceof Map 
			? unroll(value, keys.slice(1), label, Object.assign({}, { ...p, [keys[0]]: key } ))
			: Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
	).flat();
}


export function rollUnroll(data, reducer, keys, value) {
	const rolled = rollup(data, reducer, ...keys.map(k => d => d[k]));
	return unroll(rolled, keys, value);
}


export function addComponent( {
	htmlElement='div', 
	className, 
	idName
	}: {
		htmlElement?:string, 
		className?:string, 
		idName?:string
	} ): HTMLElement {
	const element = document.createElement(`${htmlElement}`)
	className ? element.classList.add(`${className}`) : null
	idName ? element.id = idName : null
	return element;
}