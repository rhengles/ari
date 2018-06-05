var node_path = require('path');
var util = require('util');
var minimist = require('minimist');
var buildReport = require('./build-report');
var copyRecursive = require('./includes/copy-recursive');

function pathRel(p) {
	return node_path.join(__dirname, p);
}

function logCopy(file, err, skip) {
	var rp = file.resourcePath;
	var stat = [];
	if (file.time) {
		stat.push(file.time.total+' ms');
	}
	if (file.stat.isFile()) {
		stat.push(file.stat.size+' bytes');
	} else if (file.stat.isDirectory()) {
		stat.push('<DIR>');
	}
	if (err) {
		stat.push(err);
	}
	if (skip) {
		stat.push('<SKIP>');
	}
	stat = stat.join(', ');
	return ''.concat(
		err ? '# ERROR ' : '. ',
		rp,
		' (',
		stat,
		')'
	);
}
function logResult(stats, printObject) {
	var output = [];
	if ( !(printObject instanceof Function) ) {
		printObject = function(o) {
			return util.inspect(o, {depth: 4});
		};
	}
	if (stats.count) {
		output.push('stats '+printObject(stats.count));
	}
	var time = stats.time;
	if (time) {
		time.plugins && time.plugins.forEach(function(plugin) {
			plugin && output.push('plugin '+printObject(plugin));
		});
		time.files && output.push('files '+printObject(time.files));
		time.over && output.push('over '+printObject(time.over));
		time.total && output.push('total '+printObject(time.total));
		time.copyDirs && output.push('copyDirs '+printObject(time.copyDirs));
		time.copyFiles && output.push('copyFiles '+printObject(time.copyFiles));
		time.copySpeeds && output.push('copySpeeds '+printObject(time.copySpeeds));
		time.copySizes && output.push('copySizes '+printObject(time.copySizes));
		time.copySpeedSizeRatio && output.push('copySpeedSizeRatio '+printObject(time.copySpeedSizeRatio));
	}
	return output;
}
function reportLoad(build) {
	var list = build && build.static;
	return list && list.slice instanceof Function && list.slice().pop();
}
function reportSave(build, stat) {
	if (!build) build = {};
	if (!build.static || !(build.static.concat instanceof Function)) build.static = [];
	stat.time.start = new Date(stat.time.start).toISOString();
	build.static = build.static.concat([stat]).slice(-100);
	return build;
}

function execute(opt) {

opt || (opt = {});
var pathSrc = pathRel('../src/static');
var pathDest = pathRel('../web');
var optBuild = opt.build;
var buildStart = new Date();
var lastBuildStart;
var filterFile;
if (optBuild && opt.skipOld) {
	lastBuildStart = new Date(optBuild.time.start);
	filterFile = function(file) {
		var stat = file.stat;
		var mtime = stat.mtime || stat.ctime;
		var match = stat.isFile() && mtime && (mtime > lastBuildStart);
		return match;
	};
}

copyRecursive({
	path: pathSrc,
	measureStats: opt.measureStats,
	measureTime: opt.measureTime,
	filterFile: filterFile,
	destpath: function destpath(file) {
		var resourcePath = node_path.join(file.dir.sub, file.name);
		var destPath = node_path.join(pathDest, resourcePath);
		file.resourcePath = resourcePath;
		file.destPath = destPath;
		return destPath;
	},
	onCopy: opt.onCopy,
	getInvalidFileTypeMessage: function(file) {
		var rp = file.resourcePath;
		return 'item is not a dir or file: '+rp;
	},
	callback: function(err, result) {
		if ( !result ) {
			result = {};
		}
		if ( !result.time ) {
			result.time = {};
		}
		if ( !result.time.start ) {
			result.time.start = buildStart;
		}
		opt.callback(err, result);
	}
});

}

execute.logCopy = logCopy;
execute.logResult = logResult;
execute.reportLoad = reportLoad;
execute.reportSave = reportSave;

module.exports = execute;

if ( require.main === module ) {
	var argv = minimist(process.argv.slice(2));
	buildReport.load(function(err, build) {
		execute({
			build: err ? null : reportLoad(build),
			skipOld: argv['skip-old'] !== false,
			measureStats: argv['stats'] !== false,
			measureTime: argv['time'] !== false,
			onCopy: function(file) {
				if (argv['log-copy-file'] !== false && file.stat.isFile()) {
					console.log(logCopy.apply(this, arguments));
				}
				if (argv['log-copy-dir'] && file.stat.isDirectory()) {
					console.log(logCopy.apply(this, arguments));
				}
			},
			callback: function(err, stats) {
				if (argv['print-result']) {
					console.log(logResult(stats).join('\n'));
				}
				if (err) throw err;
				build = reportSave(build, stats);
				buildReport.save(build, function(err) {
					if (err) throw err;
				});
			}
		});
	});
}
