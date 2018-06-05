var dirFiles = require('dir-files');
var openDir = require('./open-dir');
var copy = require('./copy');
var timePlugins = require('./time-plugins');

var dfp = dirFiles.plugins;
var hasOwnProperty = Object.prototype.hasOwnProperty;

function fnCopyDir(opt) {
	var optFilter = opt.filter;
	var optAfterFilter = opt.afterFilter;
	var optAfterOpen = opt.afterOpen;
	var optDestpath = opt.destpath;
	var optOnDir = opt.onDir;
	return {
		name: 'copyDir',
		filter: function(file) {
			if (file.name || !file.stat.isDirectory()) {
				return false;
			}
			var match = !optFilter || optFilter.call(this, file);
			optAfterFilter && optAfterFilter.call(this, file, match);
			/**/
			return match;
		},
		async: function copyDir(file, callback) {
			//var destpath = optDestpath(file);
			var self = this;
			return openDir(
				//destpath,
				optDestpath(file),
				function(err, result) {
					file.openDir = result;
					optAfterOpen && optAfterOpen.call(self, file, err, result);
					callback(err);
				}
				/*function(err) {
					optOnDir && optOnDir({
						error: err,
						file: file,
						destpath: destpath
					});
					return callback(err);
				}*/
			);
		}
	};
}
function fnCopyDirStats(file, match) {
	var res = this.result;
	if (match) {
		res.dirs++;
	} else {
		res.skipDirs++;
	}
}
function fnCopyOpenDirStats(file, err, result) {
	var res = this.result;
	if (result === openDir.EXISTS) {
		res.dirsExist++;
	} else if (result === openDir.CREATED) {
		res.dirsCreated++;
	}
}
function fnCopyFile(opt) {
	var optFilter = opt.filter;
	var optAfterFilter = opt.afterFilter;
	var optDestpath = opt.destpath;
	var optOnFile = opt.onFile;
	return {
		name: 'copyFile',
		filter: function(file) {
			if (!file.name || !file.stat.isFile()) {
				return false;
			}
			var match = !optFilter || optFilter.call(this, file);
			optAfterFilter && optAfterFilter.call(this, file, match);
			/**/
			return match;
		},
		async: function copyFile(file, callback) {
			//var destpath = optDestpath(file);
			return copy({
				input: file.fullpath,
				//output: destpath,
				output: optDestpath(file),
				callback: callback
				/*callback: function(err) {
					optOnFile && optOnFile({
						error: err,
						file: file,
						destpath: destpath
					});
					return callback(err);
				}*/
			});
		}
	};
}
function fnCopyFileStats(file, match) {
	var res = this.result;
	if (match) {
		res.files++;
		res.bytes += file.stat.size;
	} else {
		res.skipFiles++;
		res.skipBytes += file.stat.size;
	}
}
function fnCopyInitStats() {
	return {
		files: 0,
		dirs: 0,
		dirsExist: 0,
		dirsCreated: 0,
		bytes: 0,
		skipFiles: 0,
		skipDirs: 0,
		skipBytes: 0
	};
}
function fnErrorFileType(getMessage) {
	return {
		name: 'errorInvalidFileType',
		sync: function(file) {
			return new Error(getMessage(file));
		}
	};
}

function fnMeasureSpeedCopy(copyPlugin, opt) {
	var stats = opt && opt.stats || timePlugins.stats;
	return {
		initialize: function() {
			var time = this.time;
			time.copySpeeds = [];
			time.copySizes = [];
			time.copySpeedSizeRatio = [];
		},
		afterPlugin: function() {
			var pIndex = this.pIndex;
			var plugin = this.plugins[pIndex];
			var file;
			var ftime;
			var fsize;
			var ptime;
			var speed;
			var time;
			if (plugin === copyPlugin) {
				file = this.file;
				ftime = file.time;
				time = this.time;
				ptime = ftime.plugins[pIndex].time;
				fsize = file.stat.size;
				ftime.copySpeed = speed = fsize / (ptime || 1);
				time.copySpeeds.push(speed);
				time.copySizes.push(fsize);
				time.copySpeedSizeRatio.push(fsize / speed);
			}
		},
		finalize: function() {
			var time = this.time;
			time.copySpeeds = stats(time.copySpeeds);
			time.copySizes = stats(time.copySizes);
			time.copySpeedSizeRatio = stats(time.copySpeedSizeRatio);
		}
	};
}

function fnMeasureTimeCopy(opt) {
	var stats = opt && opt.stats || timePlugins.stats;
	return {
		initialize: function() {
			var time = this.time;
			time.copyDirs = [];
			time.copyFiles = [];
		},
		afterFile: function(file) {
			if (file.resourcePath) {
				var stat = file.stat;
				var time = this.time;
				if (stat.isDirectory()) {
					time.copyDirs.push(file.time.total);
				} else if (stat.isFile()) {
					time.copyFiles.push(file.time.total);
				}
			}
		},
		finalize: function() {
			var time = this.time;
			time.copyDirs = stats(time.copyDirs);
			time.copyFiles = stats(time.copyFiles);
		}
	};
}

module.exports = function copyRecursive(opt) {
	var result;
	var afterFilterDir;
	var afterFilterFile;
	var afterOpenDir;
	if (opt.measureStats) {
		result = fnCopyInitStats();
		afterFilterDir = fnCopyDirStats;
		afterFilterFile = fnCopyFileStats;
		afterOpenDir = fnCopyOpenDirStats;
	}
	var timeOpt = {
		stats: opt.fnStats,
		statsPlugins: opt.fnStatsPlugins
	};
	var measureTime = opt.measureTime
		? timePlugins(timeOpt)
		: null;
	var dfpOpt = opt.pluginsOpt || {};
	var dfpStat = dfp.stat(dfpOpt);
	var dfpQueueDir = dfp.queueDir(dfpOpt);
	var dfpReadDir = dfp.readDir(dfpOpt);
	var dfpQueueDirFiles = dfp.queueDirFiles(dfpOpt);
	var dfpCopyDir = fnCopyDir({
		filter: opt.filterDir,
		afterFilter: afterFilterDir,
		afterOpen: afterOpenDir,
		destpath: opt.destpath
		//onDir: opt.onDir
	});
	var dfpCopyFile = fnCopyFile({
		filter: opt.filterFile,
		afterFilter: afterFilterFile,
		destpath: opt.destpath
		//onFile: opt.onFile
	});
	var dfpErrorFileType = fnErrorFileType(opt.getInvalidFileTypeMessage);
	var dfpAfterStat = {
		name: 'afterStat',
		pluginTimeIgnore: true,
		sync: function afterStat(file) {
			if (file.stat.isDirectory()) {
				if (file.name) {
					this.plugins.push(dfpQueueDir);
				} else {
					this.plugins.push(dfpReadDir, dfpQueueDirFiles, dfpCopyDir);
				}
			} else if (file.stat.isFile()) {
				this.plugins.push(dfpCopyFile);
			} else {
				this.plugins.push(dfpErrorFileType);
			}
		}
	};
	var initialPlugins = [
		dfpStat,
		dfpAfterStat
	];
	var optOnCopy = opt.onCopy;

	dirFiles({
		//,path: node_path.join(file.fullpath, 'static'),
		path: opt.path,
		result: result,
		callback: function(err, count) {
			return opt.callback(err, {
				count: count,
				time: this.time
			});
		},
		processPlugins: [].concat(
			measureTime
				? [
						measureTime,
						fnMeasureTimeCopy(timeOpt),
						fnMeasureSpeedCopy(dfpCopyFile, timeOpt)
					]
				: [],
			[
				{
					beforeFile: function() {
						this.plugins = initialPlugins.slice();
					},
					afterFile: function(file/*, err, skip*/) {
						if (file.resourcePath) {
							optOnCopy && optOnCopy.apply(this, arguments);
						}
					}
				}
			]
		)
	});
};

/*
	Time per file
	Bytes per millisecond (actual speed)
	Bytes per file (average file size)
	var mspf = stats.files && Math.round(time.files / stats.files);
	var bpms = time.files && Math.round(count.bytes / time.files);
	var bpf = count.files && Math.round(count.bytes / count.files);

*/
