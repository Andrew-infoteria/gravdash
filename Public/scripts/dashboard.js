function updatePanels() {
	updateTemperaturePanel();
	updateHumidityPanel();
	updateDoorPanel();
	updateButtonPressPanel();
	updateVibrationPanel();
}

// Temperature
function prepareTemperatureChart() {
	var ctx = document.getElementById("temperature-chart");
	if (!ctx) return;
	window.charts.temperature = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: []
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

function updateTemperaturePanel() {
	var chart = window.charts.temperature;
	if (!chart) return;
	var element = document.getElementById("dashboard-range");
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?type=Temperature&from=' + from, function(records) {
		var tDatasets = {};
		for (var i = 0; i < records.length; i++) {
			var senderId = records[i].senderId;
			var label = typeof mappings[senderId] === 'undefined' ? senderId : mappings[senderId];
			var data = {x: new Date(records[i].recordTime), y: records[i].value};
			addDataToDataset(data, tDatasets, label);
		}
		var colors = [window.chartColors.red, window.chartColors.blue, window.chartColors.green, window.chartColors.yellow, window.chartColors.grey];
		var chartDatasets = [];
		for (var key in tDatasets) {
			var chartDataset = {
				label: key,
				borderColor: colors.shift(),
				data: tDatasets[key],
				lineTension: 0,
				fill: false
			}
			chartDatasets.push(chartDataset)
		}
		chart.data.datasets = chartDatasets;
		chart.update();
	});
}

// Humidity
function prepareHumidityChart() {
	var ctx = document.getElementById("humidity-chart");
	if (!ctx) return;
	window.charts.humidity = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: []
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

function updateHumidityPanel() {
	var chart = window.charts.humidity;
	if (!chart) return;
	var element = document.getElementById("dashboard-range");
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?type=Humidity&from=' + from, function(records) {
		var hDatasets = {};
		for (var i = 0; i < records.length; i++) {
			var senderId = records[i].senderId;
			var label = typeof mappings[senderId] === 'undefined' ? senderId : mappings[senderId];
			var data = {x: new Date(records[i].recordTime), y: records[i].value};
			addDataToDataset(data, hDatasets, label);
		}
		var colors = [window.chartColors.red, window.chartColors.blue, window.chartColors.green, window.chartColors.yellow, window.chartColors.grey];
		var chartDatasets = [];
		for (var key in hDatasets) {
			var chartDataset = {
				label: key,
				borderColor: colors.shift(),
				data: hDatasets[key],
				lineTension: 0,
				fill: false
			}
			chartDatasets.push(chartDataset)
		}
		chart.data.datasets = chartDatasets;
		chart.update();
	});
}

// Door
function prepareDoorOpenChart() {
	var ctx = document.getElementById("door-open-chart");
	if (!ctx) return;
	window.charts.doorOpen = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: [],
			datasets: []
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

function updateDoorPanel() {
	var chart = window.charts.doorOpen;
	if (!chart) return;
	var element = document.getElementById("dashboard-range");
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?type=Door+state&from=' + from, function(records) {
		var sort = [];
		for (var i = 0; i < records.length; i++) {
			if (records[i].value == 1) {
				var date = records[i].recordTime.split('T')[0];
				addDataToDataset(records[i], sort, date);
			}
		}
		var doDatasets = {"Open": []};
		for (var date in sort) {
			doDatasets['Open'].push({x: date, y: sort[date].length});
		}
		var colors = [window.chartColors.green, window.chartColors.red];
		var chartDatasets = [];
		for (var key in doDatasets) {
			var chartDataset = {
				label: key,
				backgroundColor: colors.shift(),
				fill: false,
				data: doDatasets[key]
			}
			chartDatasets.push(chartDataset)
		}
		var firstDate = new Date(records.reduce((min, r) => r.recordTime < min ? r.recordTime : min, records[0].recordTime));
		var lastDate = new Date(records.reduce((max, r) => r.recordTime > max ? r.recordTime : max, records[0].recordTime));
		firstDate.setDate(firstDate.getDate() - 1);
		lastDate.setDate(lastDate.getDate() + 1);
		var bound = [firstDate.toISOString().split('T')[0], lastDate.toISOString().split('T')[0]];
		chart.data.labels = bound;
		chart.data.datasets = chartDatasets;
		chart.update();
	});
}

// Button Press
function prepareButtonPressChart() {
	var ctx = document.getElementById("button-press-chart");
	if (!ctx) return;
	window.charts.buttonPress = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: [],
			datasets: []
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

function updateButtonPressPanel() {
	var chart = window.charts.buttonPress;
	if (!chart) return;
	var element = document.getElementById("dashboard-range");
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?type=Button+press&from=' + from, function(records) {
		var sort = [];
		for (var i = 0; i < records.length; i++) {
			var date = records[i].recordTime.split('T')[0];
			addDataToDataset(records[i], sort, date);
		}
		var bpDatasets = {"Single Press": [], "Double Press": [], "Long Press": []};
		for (var date in sort) {
			bpDatasets["Single Press"].push({x: date, y: sort[date].filter(record => record.value == 1).length});
			bpDatasets["Double Press"].push({x: date, y: sort[date].filter(record => record.value == 2).length});
			bpDatasets["Long Press"].push({x: date, y: sort[date].filter(record => record.value == 255).length});
		}
		var colors = [window.chartColors.red, window.chartColors.blue, window.chartColors.green, window.chartColors.yellow, window.chartColors.grey];
		var chartDatasets = [];
		for (var key in bpDatasets) {
			var chartDataset = {
				label: key,
				backgroundColor: colors.shift(),
				fill: false,
				data: bpDatasets[key]
			}
			chartDatasets.push(chartDataset)
		}
		var firstDate = new Date(records.reduce((min, r) => r.recordTime < min ? r.recordTime : min, records[0].recordTime));
		var lastDate = new Date(records.reduce((max, r) => r.recordTime > max ? r.recordTime : max, records[0].recordTime));
		firstDate.setDate(firstDate.getDate() - 1);
		lastDate.setDate(lastDate.getDate() + 1);
		var bound = [firstDate.toISOString().split('T')[0], lastDate.toISOString().split('T')[0]];
		chart.data.labels = bound;
		chart.data.datasets = chartDatasets;
		chart.update();
	});	
}

// Vibration
function prepareVibrationChart() {
	var ctx = document.getElementById("vibration-chart");
	if (!ctx) return;
	window.charts.vibration = new Chart(ctx, {
		type: 'scatter',
		data: {
			datasets: []
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
					ticks: {
						min: 0,
						suggestedMax: 200
					},
					scaleLabel: {
						display: true,
						labelString: 'Angle',
						fontSize: 20
					}
				}]
			}
		}
	});
}

function updateVibrationPanel() {
	var chart = window.charts.vibration;
	if (!chart) return;
	var element = document.getElementById("dashboard-range");
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?type=Tilt&from=' + from, function(records) {
		var vDatasets = {};
		for (var i = 0; i < records.length; i++) {
			var senderId = records[i].senderId;
			var label = typeof mappings[senderId] === 'undefined' ? senderId : mappings[senderId];
			var data = {x: new Date(records[i].recordTime), y: records[i].value};
			addDataToDataset(data, vDatasets, label);
		}
		var colors = [window.chartColors.red, window.chartColors.blue, window.chartColors.green, window.chartColors.yellow, window.chartColors.grey];
		var chartDatasets = [];
		for (var key in vDatasets) {
			var chartDataset = {
				label: key,
				backgroundColor: colors.shift(),
				fill: false,
				data: vDatasets[key]
			}
			chartDatasets.push(chartDataset)
		}
		chart.data.datasets = chartDatasets;
		chart.update();
	});
}

// General functions
var getChartData = function(url, callback) {
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'json',
		success: function (data) {
			callback(data);
		}
	});
};

function addDataToDataset(data, datasets, name) {
	if (!datasets.hasOwnProperty(name)) {
		datasets[name] = [];
	}
	datasets[name].push(data);
}
