function prepareTemperatureChart () {
	var ctx = document.getElementById("temperature-chart");
	if (!ctx) return;
	var lineColors = [window.chartColors.red, window.chartColors.blue, window.chartColors.green, window.chartColors.yellow, window.chartColors.grey];
	var chartDatasets = [];
	window.charts.temperature = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: chartDatasets
		},
		options: {
			title: {
				display: true,
				fontSize: 20,
				text: 'Temperature'
			},
			legend: {
				position: 'bottom'
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
						suggestedMin: 24
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

function prepareHumidityChart () {
	var ctx = document.getElementById("humidity-chart");
	if (!ctx) return;
	var lineColors = [window.chartColors.red, window.chartColors.blue, window.chartColors.green, window.chartColors.yellow, window.chartColors.grey];
	var chartDatasets = [];
	window.charts.humidity = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: chartDatasets
		},
		options: {
			title: {
				display: true,
				fontSize: 20,
				text: 'Humidity'
			},
			legend: {
				position: 'bottom'
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
						return ' ' + Math.round(tooltipItem.yLabel * 100) / 100 + ' %';
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
						suggestedMin: 0,
						suggestedMax: 100
					},
					scaleLabel: {
						display: true,
						labelString: 'Relative Humidity',
						fontSize: 20
					}
				}]
			}
		}
	});
}

function loadHumidityChart (datasets) {
	var ctx = document.getElementById("humidity-chart");
	if (!ctx) return;
	var lineColors = [window.chartColors.red, window.chartColors.blue, window.chartColors.green, window.chartColors.yellow, window.chartColors.grey];
	var chartDatasets = [];
	for (var key in datasets) {
		var chartDataset = {
			label: key,
			borderColor: lineColors.shift(),
			data: datasets[key],
			lineTension: 0,
			fill: false
		}
		chartDatasets.push(chartDataset)
	}
	var myLineChart = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: chartDatasets
		},
		options: {
			title: {
				display: true,
				fontSize: 20,
				text: 'Humidity'
			},
			legend: {
				position: 'bottom'
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
						return ' ' + Math.round(tooltipItem.yLabel * 100) / 100 + ' %';
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
						suggestedMin: 0,
						suggestedMax: 100
					},
					scaleLabel: {
						display: true,
						labelString: 'Relative Humidity',
						fontSize: 20
					}
				}]
			}
		}
	});
}

function loadDoorOpenChart (datasets, bound) {
	var ctx = document.getElementById("door-open-chart");
	var barColors = [window.chartColors.green, window.chartColors.red];
	var chartDatasets = []
	for (var key in datasets) {
		var chartDataset = {
			label: key,
			backgroundColor: barColors.shift(),
			fill: false,
			data: datasets[key]
		}
		chartDatasets.push(chartDataset)
	}
	var myBarChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: bound,
			datasets: chartDatasets
		},
		options: {
			title: {
				display: true,
				fontSize: 20,
				text: 'Door Open'
			},
			legend: {
				position: 'bottom'
			},
			scales: {
				xAxes: [{
					type: 'time',
					display: true,
					time: {
						unit: 'day'
					}
				}],
				yAxes: [{
					ticks: {
						min: 0
					},
					scaleLabel: {
						display: true,
						labelString: 'Number of times',
						fontSize: 20
					}
				}]
			}
		}
	});
}

function loadButtonPressChart (datasets, bound) {
	var ctx = document.getElementById("button-press-chart");
	var barColors = [window.chartColors.red, window.chartColors.blue, window.chartColors.green, window.chartColors.yellow, window.chartColors.grey];
	var chartDatasets = []
	for (var key in datasets) {
		var chartDataset = {
			label: key,
			backgroundColor: barColors.shift(),
			fill: false,
			data: datasets[key]
		}
		chartDatasets.push(chartDataset)
	}
	var myBarChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: bound,
			datasets: chartDatasets
		},
		options: {
			title: {
				display: true,
				fontSize: 20,
				text: 'Button Press'
			},
			legend: {
				position: 'bottom'
			},
			scales: {
				xAxes: [{
					type: 'time',
					display: true,
					time: {
						unit: 'day'
					}
				}],
				yAxes: [{
					ticks: {
						min: 0
					},
					scaleLabel: {
						display: true,
						labelString: 'Number of times',
						fontSize: 20
					}
				}]
			}
		}
	});
}

function loadVibrationChart (datasets) {
	var ctx = document.getElementById("vibration-chart");
	var barColors = [window.chartColors.red, window.chartColors.blue, window.chartColors.green, window.chartColors.yellow, window.chartColors.grey];
	var chartDatasets = []
	for (var key in datasets) {
		var chartDataset = {
			label: key,
			backgroundColor: barColors.shift(),
			fill: false,
			data: datasets[key]
		}
		chartDatasets.push(chartDataset)
	}
	var myBarChart = new Chart(ctx, {
		type: 'scatter',
		data: {
			datasets: chartDatasets
		},
		options: {
			title: {
				display: true,
				fontSize: 20,
				text: 'Vibration(Tilt)'
			},
			legend: {
				position: 'bottom'
			},
			tooltips: {
				titleFontSize: 14,
				bodyFontSize: 14,
				callbacks: {
					title: function(tooltipItems, data) {
						var datetime = tooltipItems[0].xLabel;
						return datetime.substring(0, datetime.indexOf('.'));
					},
					label: function(tooltipItem, data) {
						return ' ' + Math.round(tooltipItem.yLabel * 100) / 100 + 'º';
					}
				}
			},
			scales: {
				xAxes: [{
					type: 'time',
				}],
				yAxes: [{
					type: 'linear',
					scaleLabel: {
						display: true,
						labelString: 'Angel',
						fontSize: 20
					}
				}],
			}
		}
	});
}

var getChartData = function (url, callback) {
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'json',
		success: function (data) {
			callback(data);
		}
	});
};
