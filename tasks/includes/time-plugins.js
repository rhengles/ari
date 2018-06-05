
var hasOwnProperty = Object.prototype.hasOwnProperty;

function median(series, count) {
	var odd = count % 2;
	var half = (count - odd) * 0.5;
	return odd
		? series[half]
		: (series[half-1] + series[half]) * 0.5;
}

function subtree(series, count, level) {
	var odd = count % 2;
	var half = (count - odd) * 0.5;
	var halfodd = half+odd;
	var median = odd
		? series[half]
		: (series[half-1] + series[half]) * 0.5;
	return (level > 1 && half > 0)
		? [].concat(
				subtree(series.slice(0, half), half, level-1),
				[median],
				subtree(series.slice(halfodd, count), half, level-1)
			)
		: [median];
}

function numericSort(a,b) {
	return a - b;
}

function stats(series) {
	series = series && series.sort(numericSort);
	var count = series && series.length;
	var sum = 0;
	//var sumDev = 0;
	var min = +Infinity;
	var max = -Infinity;
	var i, t;
	for ( i = 0; i < count; i++ ) {
		t = series[i];
		sum += t;
		(t < min) && (min = t);
		(t > max) && (max = t);
	}
	var avg = count ? sum / count : sum;
	/*
	for ( i = 0; i < count; i++ ) {
		t = series[i];
		sumDev += Math.pow(t-avg, 2);
	}
	var variance = count ? sumDev / count : sumDev;
	*/
	return {
		sum: sum,
		count: count,
		avg: avg,
		min: min,
		max: max,
		//variance: variance,
		//stdDev: Math.sqrt(variance),
		//median: count ? median(series, count) : 0,
		octiles: count ? subtree(series, count, 3) : [0]
	};
}

function initialize() {
	this.time = {
		start: Date.now(),
		plugins: [],
		files: [],
		over: [],
		total: 0
	};
	this.timePluginMap = {};
}

function fnFinalize(opt) {
	var fnStats = opt && opt.stats || stats;
	var fnStatsPlugins = opt && opt.statsPlugins || stats;
	return function finalize() {
		var time = this.time;
		var now = Date.now();
		time.total = now - time.start;
		time.files = fnStats(time.files);
		time.over = fnStats(time.over);
		time.plugins = time.plugins.map(function(v, i) {
			var name = v.name;
			v = fnStatsPlugins(v.times);
			v.name = name || 'plugin #'+(i+1);
			return v;
		});
	};
}

function beforeFile(file) {
	var now = Date.now();
	file.time = {
		start: now,
		startPlugin: now,
		plugins: [],
		pluginsSum: 0,
		total: 0
	};
}

function afterFile(file) {
	var time = this.time;
	var ftime = file.time;
	var ftotal;
	var fover;
	ftime.total = ftotal = ftime.startPlugin - ftime.start;
	ftime.over = fover = ftotal - ftime.pluginsSum;
	time.files.push(ftotal);
	time.over.push(fover);
}

function afterPlugin() {
	var file = this.file;
	var ftime = file.time;
	var startPlugin = ftime.startPlugin;
	var now = Date.now();
	ftime.startPlugin = now;
	var pIndex = this.pIndex;
	var pluginObj = this.plugins[pIndex];
	var pName = pluginObj.name;
	//
	if ( !pName || pluginObj.pluginTimeIgnore ) return;
	//
	var time = this.time;
	var timePluginMap = this.timePluginMap;
	var tpIndex;
	if (hasOwnProperty.call(timePluginMap, pName)) {
		tpIndex = timePluginMap[pName];
	} else {
		timePluginMap[pName] = tpIndex = time.plugins.length;
	}
	var timePlugin = now - startPlugin;
	var timePluginObj = time.plugins[tpIndex];
	if ( !timePluginObj ) {
		time.plugins[tpIndex] = timePluginObj = {
			name: pName,
			times: []
		};
	}
	timePluginObj.times.push(timePlugin);
	ftime.plugins[pIndex] = {
		name: pName,
		time: timePlugin
	};
	ftime.pluginsSum += timePlugin;
}

function timePlugins(opt) {
	return {
		//median,
		//stats,
		initialize: initialize,
		finalize: fnFinalize(opt),
		beforeFile: beforeFile,
		afterFile: afterFile,
		afterPlugin: afterPlugin
	};
}

timePlugins.median = median;
timePlugins.subtree = subtree;
timePlugins.stats = stats;

module.exports = timePlugins;
