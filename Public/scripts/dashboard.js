function loadTemperatureGraph (records) {
	var ctx = document.getElementById("temperature-chart");
	var data = [{x: 10, y: 20}, {x: 15, y: 10}];
	var options = {
        scales: {
            yAxes: [{
                stacked: true
            }]
        }
    };
	var myLineChart = new Chart(ctx, {
		type: 'line',
		data: {
	        datasets: [{
	            label: 'Singapore',
				borderColor: 'rgb(255, 99, 132)',
	            data: records,
		        lineTension: 0,
	            fill: false
	        }]
	    },
		options: {
			title: {
				display: true,
				fontSize: 20,
				text: 'Temperature'
			},
			legend: {
				display: false
			},
			tooltips: {
				mode: 'index',
				intersect: false,
				titleFontSize: 14,
				bodyFontSize: 14,
	            callbacks: {
	                title: function(tooltipItems, data) {
	                	var datetime = tooltipItems[0].xLabel;
	                    return datetime.substring(0, datetime.indexOf('.'));
	                },
	                label: function(tooltipItem, data) {
	                    return ' ' + Math.round(tooltipItem.yLabel * 100) / 100 + ' ºC';
	                }
	            }
			},
			hover: {
				mode: 'nearest',
				intersect: true
			},
	        scales: {
	            xAxes: [{
	                type: 'time'
	            }],
				yAxes: [{
					type: 'linear',
					ticks: {
						suggestedMin: 22
					},
					scaleLabel: {
						display: true,
						labelString: 'Degrees Celcius',
						fontSize: 20
					}
				}]
	        }
		}
	});
}

function getYAverage(records) {
	var total = 0;
	for(var i = 0; i < records.length; i++) {
	    total += records[i].y;
	}
	return total / records.length;
}
