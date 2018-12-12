let width = 700
let height = 500

let tooltip = d3.select('#tooltip')

let offset = {
	top : 5,
	left : 15,
}

let margins = {
	'top' : 40,
	'right' : 20,
	'bottom' : 50,
	'left' : 50,
}

function formatPop(x) {
	return Math.round(x / 1000000)
}

let xScale = d3.scaleLinear()
	.domain([1,0])
	.range([0,width-margins.left-margins.right])

let yScale = d3.scalePow()
	.domain([100000,0])
	.range([0,height-margins.top-margins.bottom])
	.exponent(.4)
	.clamp(true)

let rScale = d3.scaleSqrt()
	.domain([0,1400000000])
	.range([1,20])
	.exponent(.3)

let color = d3.scaleOrdinal()
	.domain(['North America','South America','Africa','Asia','Europe','Oceania'])
	.range(['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0','#f0027f'])


let svg = d3.select('#chart-2').append('svg')
	.attr('width',width)
	.attr('height',height)

let inner = svg.append('g')
	.attr('transform',`translate(${margins.left},${margins.top})`)

let axisShell = inner.append('g')

let xAxis = d3.axisBottom(xScale)
	.tickSize(-height+margins.top+margins.bottom)

let yAxis = d3.axisLeft()
	.scale(yScale)
	.tickSize(-width+margins.left+margins.right)
	
axisShell.append('g').call(yAxis)

axisShell.append('g')
	.attr('transform',`translate(0,${height-margins.top-margins.bottom})`)
	.call(xAxis)

let axisLabels = svg.append('g')
					.attr('class', 'labels-g')

let yAxisLabel = axisLabels.append('text')
					.text('Gender inequality index')
					.attr('class', 'label')
					.attr('text-anchor', 'middle')
					.attr('x', width / 2)
					.attr('y', height - 20)

let xAxisLabel = axisLabels.append('text')
					.text ('GDP per capita')
					.attr('class','label')
					.attr('text-anchor', 'middle')
					.attr('x', margins.left)
					.attr('y', 20)

let marks = inner.append('g')

d3.json('./data.json').then((data) => {
	let filteredData = data.filter((d) => {
		if (d['Gender inequality index'] && d['GDP per capita']) {
			return true
		} else {
			return false
		}
 	})

	marks.selectAll('circle')
		.data(filteredData)
		.enter()
		.append('circle')
		.classed('country', true)
		.attr('r', (d) => {
			return rScale(d['Population'])
		})
		.attr('cx', (d) => {
			return xScale(d['Gender inequality index'])
		})
		.attr('cy', (d) => {
			return yScale(d['GDP per capita'])
		})
		.attr('fill', (d) => {
			return color(d['Continent'])
		})
		.on('mouseover',(d)=> {
			// Get the mouse's position 
			let left = d3.event.pageX + offset.left
			let top = d3.event.pageY + offset.top

			let html = `${d.Country}<br/>Population: ${formatPop(d.Population)} million<br/>GDP per capita $${d['GDP per capita']}<br/>Gender inequality index ${d['Gender inequality index']}`

			// write the country name in the tooltip
			tooltip.html(html)
				.style ('left', left + 'px')
				.style ('top', top + 'px')
				.style('display', 'block')
		})
		.on('mouseleave',(d) => {
			tooltip.html('')
				.style('display', 'none')
		})
})


d3.json('./laws.json').then((data) => {

	console.log(data)

	const tableHolder = d3.select('#chart-3')
	const table = tableHolder.append('table')
	const thead = table.append('thead')
	const tbody = table.append('tbody')

	var columns = ['country','gender employment nondiscrimination','domestic violence legislation','legislative quotas']

	let columnsNiceName = {
		'country' : 'Country',
		'gender employment nondiscrimination' : 'Law preventing gender discrimation at work?',
		'domestic violence legislation': 'Domestic violence legislation?',
		'legislative quotas': "Legislate quota?",
	}

	thead.append('tr')
	  .selectAll('th')
	    .data(columns)
	    .enter()
	  .append('th')
	    .text(function (d) { return columnsNiceName[d] })

	var rows = tbody.selectAll('tr')
	    .data(data)
	    .enter() 
	  .append('tr')

	var cells = rows.selectAll('td')
	    .data(function(row) {
	    	return columns.map(function (column) {
	    		return { column: column, value: row[column] }
	      })
      })
      .enter()
    .append('td')
      .text(function (d) {
      	return d.value
      })
      .attr('class', (d) => {
      	if ( d.column === 'gender employment nondiscrimination') {
      		if (d.value === 'No') {
      			return 'highlight'
      		} 
      	} else if (d.column === 'domestic violence legislation') {
      		 if (d.value === 'No') {
      			return 'highlight'
      		} 
      	} else if (d.column === 'legislative quotas') {
      		if (d.value !== 'No quota') {
      			return 'highlight'
      		}
      	} else {
      		return ''
      	}
      })

  return table;
})