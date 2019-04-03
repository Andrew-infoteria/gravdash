function prepareCharts(slide) {
	prepareTemperatureChart(slide);
	prepareHumidityChart(slide);
	prepareDoorOpenChart(slide);
	prepareButtonPressChart(slide);
	prepareVibrationChart(slide);
	prepareOccupancyChart(slide);
}

function updateActiveSlide(animate = true) {
	var slide = $(".slick-current");
	if (!slide) return;
	updateTemperaturePanel(slide, animate);
	updateHumidityPanel(slide, animate);
	updateDoorPanel(slide, animate);
	updateButtonPressPanel(slide, animate);
	updateVibrationPanel(slide, animate);
	updateOccupancyPanel(slide, animate);
}

function updateSlideControls() {
	$(".fa-arrow-left").parent().css("color", isFirstSlide() ? "lightgrey" : "dimgrey");
	$(".fa-arrow-right").parent().css("color", isLastSlide() ? "lightgrey" : "dimgrey");
}

// Temperature
function prepareTemperatureChart(slide) {
	var ctx = slide.find("#temperature-chart")[0];
	if (!ctx) return;
	var area = slide.data("area");
	window.charts[area].temperature = new Chart(ctx, {
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
				mode: 'nearest',
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

function updateTemperaturePanel(slide, animate = true) {
	var area = slide.data("area");
	var chart = window.charts[area].temperature;
	if (!chart) return;
	var element = slide.find(".dashboard-range")[0];
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?area=' + area + '&type=Temperature&from=' + from, function(records) {
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
		chart.options.animation.duration = animate ? Chart.defaults.global.animation.duration : 0;
		chart.update();
		if (records.length > 0) {
			var temperatures = records.reduce(function (a, r) { a.push(parseFloat(r.value)); return a; }, []);
			var min = Math.min(...temperatures);
			var max = Math.max(...temperatures);
			var avg = temperatures.reduce(function(a, b) { return a + b; }) / temperatures.length;
		}
		slide.find(".max-temp b").html(max ? max.toFixed(2) + "ºC" : "N/A");
		slide.find(".min-temp b").html(min ? min.toFixed(2) + "ºC" : "N/A");
		slide.find(".avg-temp b").html(avg ? avg.toFixed(2) + "ºC" : "N/A");
	});
}

// Humidity
function prepareHumidityChart(slide) {
	var ctx = slide.find("#humidity-chart")[0];
	if (!ctx) return;
	var area = slide.data("area");
	window.charts[area].humidity = new Chart(ctx, {
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
				mode: 'nearest',
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

function updateHumidityPanel(slide, animate = true) {
	var area = slide.data("area");
	var chart = window.charts[area].humidity;
	if (!chart) return;
	var element = slide.find(".dashboard-range")[0];
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?area=' + area + '&type=Humidity&from=' + from, function(records) {
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
		chart.options.animation.duration = animate ? Chart.defaults.global.animation.duration : 0;
		chart.update();
		if (records.length > 0) {
			var humidities = records.reduce(function (a, r) { a.push(parseFloat(r.value)); return a; }, []);
			var min = Math.min(...humidities);
			var max = Math.max(...humidities);
			var avg = humidities.reduce(function(a, b) { return a + b; }) / humidities.length;
		}
		slide.find(".min-humid b").html(min ? min.toFixed(2) + "%" : "N/A");
		slide.find(".max-humid b").html(max ? max.toFixed(2) + "%" : "N/A");
		slide.find(".avg-humid b").html(avg ? avg.toFixed(2) + "%" : "N/A");
	});
}

// Door
function prepareDoorOpenChart(slide) {
	var ctx = slide.find("#door-open-chart")[0];
	if (!ctx) return;
	var area = slide.data("area");
	window.charts[area].doorOpen = new Chart(ctx, {
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

function updateDoorPanel(slide, animate = true) {
	var area = slide.data("area");
	var chart = window.charts[area].doorOpen;
	if (!chart) return;
	var element = slide.find(".dashboard-range")[0];
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?area=' + area + '&type=Door+state&from=' + from, function(records) {
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
		var bound = [];
		if (records.length > 0) {
			var firstDate = new Date(records.reduce((min, r) => r.recordTime < min ? r.recordTime : min, records[0].recordTime));
			var lastDate = new Date(records.reduce((max, r) => r.recordTime > max ? r.recordTime : max, records[0].recordTime));
			firstDate.setDate(firstDate.getDate() - 1);
			lastDate.setDate(lastDate.getDate() + 1);
			bound = [firstDate.toISOString().split('T')[0], lastDate.toISOString().split('T')[0]];
		}
		chart.data.labels = bound;
		chart.data.datasets = chartDatasets;
		chart.options.animation.duration = animate ? Chart.defaults.global.animation.duration : 0;
		chart.update();
		var latest = records[records.length - 1];
		var nowIcon = slide.find(".door-now i.fas");
		var nowText = slide.find(".door-now div b");
		nowIcon.removeClass('fa-door-open fa-door-closed');
		if (!latest) {
			nowText.html('N/A');
			nowIcon.addClass('fa-door-open');
		} else if (latest.value == 1) {
			nowText.html('Open');
			nowIcon.addClass('fa-door-open');
		} else {
			nowText.html('Closed');
			nowIcon.addClass('fa-door-closed');
		}
	});
}

// Button Press
function prepareButtonPressChart(slide) {
	var ctx = slide.find("#button-press-chart")[0];
	if (!ctx) return;
	var area = slide.data("area");
	window.charts[area].buttonPress = new Chart(ctx, {
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

function updateButtonPressPanel(slide, animate = true) {
	var area = slide.data("area");
	var chart = window.charts[area].buttonPress;
	if (!chart) return;
	var element = slide.find(".dashboard-range")[0];
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?area=' + area + '&type=Button+press&from=' + from, function(records) {
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
		var bound = [];
		if (records.length > 0) {
			var firstDate = new Date(records.reduce((min, r) => r.recordTime < min ? r.recordTime : min, records[0].recordTime));
			var lastDate = new Date(records.reduce((max, r) => r.recordTime > max ? r.recordTime : max, records[0].recordTime));
			firstDate.setDate(firstDate.getDate() - 1);
			lastDate.setDate(lastDate.getDate() + 1);
			bound = [firstDate.toISOString().split('T')[0], lastDate.toISOString().split('T')[0]];
		}
		chart.data.labels = bound;
		chart.data.datasets = chartDatasets;
		chart.options.animation.duration = animate ? Chart.defaults.global.animation.duration : 0;
		chart.update();
	});	
}

// Vibration
function prepareVibrationChart(slide) {
	var ctx = slide.find("#vibration-chart")[0];
	if (!ctx) return;
	var area = slide.data("area");
	window.charts[area].vibration = new Chart(ctx, {
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

function updateVibrationPanel(slide, animate = true) {
	var area = slide.data("area");
	var chart = window.charts[area].vibration;
	if (!chart) return;
	var element = slide.find(".dashboard-range")[0];
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?area=' + area + '&type=Ready,Slight+movement,Drop,Tilt&from=' + from, function(records) {
		var vDatasets = {};
		for (var i = 0; i < records.length; i++) {
			if (records[i].type == "Tilt") {
				var senderId = records[i].senderId;
				var label = typeof mappings[senderId] === 'undefined' ? senderId : mappings[senderId];
				var data = {x: new Date(records[i].recordTime), y: records[i].value};
				addDataToDataset(data, vDatasets, label);
			}
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
		chart.options.animation.duration = animate ? Chart.defaults.global.animation.duration : 0;
		chart.update();
		var latest = records[records.length - 1];
		var nowIcon = slide.find(".vibartion-now i.fas");
		var nowText = slide.find(".vibartion-now div b");
		nowIcon.removeClass("fa-check-circle fa-exclamation-circle fa-minus-circle fa-adjust");
		if (!latest) {
			nowIcon.addClass("fa-check-circle");
			nowText.html("N/A");
		} else if (latest.type.toLowerCase() == "ready") {
			nowIcon.addClass("fa-check-circle");
			nowText.html("Stable");
		} else if (latest.type.toLowerCase() == "slight movement") {
			nowIcon.addClass("fa-exclamation-circle");
			nowText.html("Slight Movement");
		} else if (latest.type.toLowerCase() == "drop") {
			nowIcon.addClass("fa-minus-circle");
			nowText.html("Falling");
		} else {
			nowIcon.addClass("fa-adjust");
			nowText.html("Tilted " + latest.value + "º");
		}
	});
}

// Vibration
function prepareOccupancyChart(slide) {
	var ctx = slide.find("#occupancy-chart")[0];
	if (!ctx) return;
	var area = slide.data("area");
	window.charts[area].occupancy = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: [],
			datasets: []
		},
		options: {
			title: {
				display: true,
				fontSize: 20,
				text: 'Motion'
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

function updateOccupancyPanel(slide, animate = true) {
	var area = slide.data("area");
	var chart = window.charts[area].occupancy;
	if (!chart) return;
	var element = slide.find(".dashboard-range")[0];
	var range = element.options[element.selectedIndex].value.split('/');
	var from = moment().subtract(range[0], range[1]).utc().format('YYYY-MM-DDTHH:mm:ss');
	getChartData('/api/records?area=' + area + '&type=Motion+Detected&from=' + from, function(records) {
		var sort = [];
		for (var i = 0; i < records.length; i++) {
			var date = records[i].recordTime.split('T')[0];
			addDataToDataset(records[i], sort, date);
		}
		var oDatasets = {"Motion Detected": []};
		for (var date in sort) {
			oDatasets["Motion Detected"].push({x: date, y: sort[date].length});
		}
		var colors = [window.chartColors.grey];
		var chartDatasets = [];
		for (var key in oDatasets) {
			var chartDataset = {
				label: key,
				backgroundColor: colors.shift(),
				fill: false,
				data: oDatasets[key]
			}
			chartDatasets.push(chartDataset)
		}
		var bound = [];
		if (records.length > 0) {
			var firstDate = new Date(records.reduce((min, r) => r.recordTime < min ? r.recordTime : min, records[0].recordTime));
			var lastDate = new Date(records.reduce((max, r) => r.recordTime > max ? r.recordTime : max, records[0].recordTime));
			firstDate.setDate(firstDate.getDate() - 1);
			lastDate.setDate(lastDate.getDate() + 1);
			bound = [firstDate.toISOString().split('T')[0], lastDate.toISOString().split('T')[0]];
		}
		chart.data.labels = bound;
		chart.data.datasets = chartDatasets;
		chart.options.animation.duration = animate ? Chart.defaults.global.animation.duration : 0;
		chart.update();
		var latest = records[records.length - 1];
		var strLastAct = latest ? moment(latest.recordTime).fromNow() : "N/A";
		slide.find(".last-activity b").html(strLastAct);
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
