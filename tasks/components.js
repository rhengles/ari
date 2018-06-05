var fs = require('fs');
var node_path = require('path');
var dirFiles = require('dir-files');
var util = require('util');
var minimist = require('minimist');
var moment = require('moment');
var buildReport = require('./build-report');
var dfpIsComponent = require('./includes/dir-plugins/is-component');
var dfpRenderComponent = require('./includes/dir-plugins/render-component');
var dfpResourcesComponent = require('./includes/dir-plugins/resources-component');

function pathRel(p) {
	return node_path.join(__dirname, p).replace(/\\/g, '/');
}

var dfp = dirFiles.plugins;
// var argv = process.argv.slice(2);

function logComponent(file, err, skip) {
	var comp = file.component;
	var cmod = comp.modified;
	var stat = [];
	if (err) stat.push(err);
	if (skip) stat.push('<SKIP>');
	if (comp.changed) stat.push('changed');
	if (cmod && cmod.html) stat.push('html: '+moment.duration(cmod.html).humanize());
	if (cmod && cmod.js) stat.push('js: '+moment.duration(cmod.js).humanize());
	if (cmod && cmod.scss) stat.push('scss: '+moment.duration(cmod.scss).humanize());
	stat = stat.join(', ');
	return ''.concat(
		err ? '# ERROR ' : '. ',
		comp.path,
		stat.length ? ' ('+stat+')' : ''
	);
}
function logResult(stats, printObject) {
	var output = [];
	if ( !(printObject instanceof Function) ) {
		printObject = function(o) {
			return util.inspect(o, {depth: 4});
		};
	}
	var count = stats.count;
	if (count) {
		// output.push('stats '+printObject(stats.count));
		count.dirCount && output.push('dir count '+printObject(count.dirCount));
		count.dirRec && output.push('dir rec '+printObject(count.dirRec));
		count.dirTest && output.push('dir test '+printObject(count.dirTest));
		count.dirMake && output.push('dir make '+printObject(count.dirMake));
	}
	var time = stats.time;
	if (time) {
		time.plugins && time.plugins.forEach(function(plugin) {
			plugin && output.push('plugin '+printObject(plugin));
		});
		time.componentBundle && output.push('c.bundle '+printObject(time.componentBundle));
		time.componentGenerate && output.push('c.generate '+printObject(time.componentGenerate));
		time.componentOpenDir && output.push('c.opendir '+printObject(time.componentOpenDir));
		time.componentWrite && output.push('c.write '+printObject(time.componentWrite));
	}
	return output;
}
function logResource(file, err, skip) {
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
		err ? '  # ERROR ' : '  . ',
		rp,
		' (',
		stat,
		')'
	);
}
function logResourceResult(stats, printObject) {
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
	var list = build && build.components;
	return list && list.slice instanceof Function && list.slice().pop();
}
function reportSave(build, stat) {
	if (!build) build = {};
	if (!build.components || !(build.components.concat instanceof Function)) build.components = [];
	stat.time.start = new Date(stat.time.start).toISOString();
	build.components = build.components.concat([stat]).slice(-100);
	return build;
}
function fnErrorFileType(getMessage) {
	return {
		name: 'errorInvalidFileType',
		sync: function(file) {
			return new Error(getMessage(file));
		}
	};
}

var measureTimeComponent = {
	initialize: function() {
		var time = this.time;
		time.componentBundle = [];
		time.componentGenerate = [];
		time.componentOpenDir = [];
		time.componentWrite = [];
	},
	afterFile: function(file) {
		var comp = file.component;
		var compTime = comp && comp.time;
		if (compTime) {
			var time = this.time;
			time.componentBundle.push(compTime.bundle);
			time.componentGenerate.push(compTime.generate);
			time.componentOpenDir.push(compTime.openDir);
			time.componentWrite.push(compTime.write);
		}
	},
	finalize: function() {
		var time = this.time;
		var stats = dirFiles.timePlugins.stats;
		time.componentBundle = stats(time.componentBundle);
		time.componentGenerate = stats(time.componentGenerate);
		time.componentOpenDir = stats(time.componentOpenDir);
		time.componentWrite = stats(time.componentWrite);
	}
};

var measureStatsComponent = {
	initialize: function() {
		var rs = {};
		rs.dirCount = [];
		rs.dirRec = [];
		rs.dirTest = [];
		rs.dirMake = [];
		rs.htmlMod = [];
		rs.jsMod = [];
		rs.scssMod = [];
		this.result.stats = rs;
	},
	afterFile: function(file) {
		var comp = file.component;
		var compStats = comp && comp.dir;
		var mod = comp && comp.modified;
		var rs = this.result.stats;
		var day = 1000 * 60 * 60 * 24;
		if (compStats) {
			rs.dirCount.push(compStats.count);
			rs.dirRec.push(compStats.rec);
			rs.dirTest.push(compStats.test);
			rs.dirMake.push(compStats.make);
		}
		if (mod) {
			mod.html && rs.htmlMod.push(mod.html / day);
			mod.js && rs.jsMod.push(mod.js / day);
			mod.scss && rs.scssMod.push(mod.scss / day);
		}
	},
	finalize: function() {
		var rs = this.result.stats;
		var stats = dirFiles.timePlugins.stats;
		rs.dirCount = stats(rs.dirCount);
		rs.dirRec = stats(rs.dirRec);
		rs.dirTest = stats(rs.dirTest);
		rs.dirMake = stats(rs.dirMake);
		rs.htmlMod = stats(rs.htmlMod);
		rs.jsMod = stats(rs.jsMod);
		rs.scssMod = stats(rs.scssMod);
	}
};

var measureStatsResources = {
	initialize: function() {
		var rst = {};
		rst.bytes = [];
		rst.dirs = [];
		rst.dirsCreated = [];
		rst.dirsExist = [];
		rst.files = [];
		rst.skipBytes = [];
		rst.skipDirs = [];
		rst.skipFiles = [];
		this.result.resourcesStats = rst;
	},
	afterFile: function(file) {
		var comp = file.component;
		var crst = comp && comp.resourcesStats;
		var rst = this.result.resourcesStats;
		if (crst) {
			rst.bytes.push(crst.bytes);
			rst.dirs.push(crst.dirs);
			rst.dirsCreated.push(crst.dirsCreated);
			rst.dirsExist.push(crst.dirsExist);
			rst.files.push(crst.files);
			rst.skipBytes.push(crst.skipBytes);
			rst.skipDirs.push(crst.skipDirs);
			rst.skipFiles.push(crst.skipFiles);
		}
	},
	finalize: function() {
		var rst = this.result.resourcesStats;
		var stats = dirFiles.timePlugins.stats;
		rst.bytes = stats(rst.bytes);
		rst.dirs = stats(rst.dirs);
		rst.dirsCreated = stats(rst.dirsCreated);
		rst.dirsExist = stats(rst.dirsExist);
		rst.files = stats(rst.files);
		rst.skipBytes = stats(rst.skipBytes);
		rst.skipDirs = stats(rst.skipDirs);
		rst.skipFiles = stats(rst.skipFiles);
	}
};

function combinePluginsTimes(result, comp) {
	var rslice = result.slice();
	for (var i = 0, ii = comp.length; i < ii; i++) {
		var cp = comp[i];
		var cname = cp.name;
		var pmat = null;
		for (var j = 0, jj = rslice.length; j < jj; j++) {
			var rp = rslice[j];
			if (rp.name === cname) {
				pmat = rp;
				rslice.splice(j,1);
				j--;
				jj--;
				break;
			}
		}
		if (pmat) {
			if (!pmat.times) console.log(pmat);
			pmat.times = pmat.times.concat(cp.times);
		} else {
			result.push(cp);
		}
	}
}

function finalizePluginsTimes(result, stats) {
	for (var i = 0, ii = result.length; i < ii; i++) {
		var rp = result[i];
		var name = rp.name;
		rp = stats(rp.times);
		rp.name = name;
		result[i] = rp;
	}
}

var measureTimeResources = {
	initialize: function() {
		var rst = {};
		rst.copyDirs = [];
		rst.copyFiles = [];
		rst.copySizes = [];
		rst.copySpeedSizeRatio = [];
		rst.copySpeeds = [];
		rst.files = [];
		rst.over = [];
		rst.plugins = [];
		rst.total = [];
		this.result.resourcesTime = rst;
	},
	afterFile: function(file) {
		var comp = file.component;
		var crst = comp && comp.resourcesTime;
		var rst = this.result.resourcesTime;
		if (crst) {
			rst.copyDirs = rst.copyDirs.concat(crst.copyDirs);
			rst.copyFiles = rst.copyFiles.concat(crst.copyFiles);
			rst.copySizes = rst.copySizes.concat(crst.copySizes);
			rst.copySpeedSizeRatio = rst.copySpeedSizeRatio.concat(crst.copySpeedSizeRatio);
			rst.copySpeeds = rst.copySpeeds.concat(crst.copySpeeds);
			rst.files = rst.files.concat(crst.files);
			rst.over = rst.over.concat(crst.over);
			combinePluginsTimes(rst.plugins, crst.plugins);
			rst.total.push(crst.total);
		}
	},
	finalize: function() {
		var rst = this.result.resourcesTime;
		var stats = dirFiles.timePlugins.stats;
		rst.copyDirs = stats(rst.copyDirs);
		rst.copyFiles = stats(rst.copyFiles);
		rst.copySizes = stats(rst.copySizes);
		rst.copySpeedSizeRatio = stats(rst.copySpeedSizeRatio);
		rst.copySpeeds = stats(rst.copySpeeds);
		rst.files = stats(rst.files);
		rst.over = stats(rst.over);
		finalizePluginsTimes(rst.plugins, stats);
		rst.total = stats(rst.total);
	}
}

function execute(opt) {

	var optBuild = opt.build;
	var optOnComponent = opt.onComponent;
	var optOnResourceCopy = opt.onResourceCopy;
	var measureTime = opt.measureTime ? dirFiles.timePlugins() : null;
	var buildStart = new Date();
	var lastBuildStart;
	var checkDateRender = false;
	var checkDateResources = false;
	if (optBuild && opt.skipOld) {
		lastBuildStart = new Date(optBuild.time.start);
		checkDateRender = opt.render;
		checkDateResources = opt.resources;
	}
	var dfpOpt = opt.pluginsOpt || {};
	var dfpStat = dfp.stat(dfpOpt);
	var dfpQueueDir = dfp.queueDir(dfpOpt);
	var dfpReadDir = dfp.readDir(dfpOpt);
	var dfpQueueDirFiles = dfp.queueDirFiles(dfpOpt);
	var dfpComponentRender = dfpRenderComponent(opt.measureTime
		? {
				onStart: function(obj) {
					var time = {};
					time.start = Date.now();
					time.bundle = 0;
					time.generate = 0;
					time.openDir = 0;
					time.write = 0;
					obj.component.time = time;
				},
				onBundle: function(obj) {
					var time = obj.component.time;
					var now = Date.now();
					time.bundle = now - time.start;
					time.start = now;
				},
				onGenerate: function(obj) {
					var time = obj.component.time;
					var now = Date.now();
					time.generate = now - time.start;
					time.start = now;
				},
				onOpenDir: function(obj) {
					var time = obj.component.time;
					var now = Date.now();
					time.openDir = now - time.start;
					time.start = now;
				},
				onFinish: function(obj, err) {
					var time = obj.component.time;
					var now = Date.now();
					time.write = now - time.start;
					time.start = void 0;
					time.error = err;
				}
			}
		: null
	);
	function afterIsComponent(file) {
		var comp = file.component;
		if (comp) {
			if (opt.render) {
				if (checkDateRender) {
					var last;
					comp.processed = false;
					comp.processedFiles = 0;
					comp.otherFiles = [];
					this.plugins.push(dfp.queueDirFiles({
						filter: function(subFile) {
							subFile.componentOwner = file;
							return subFile;
						}
					}));
				} else {
					this.plugins.push(dfpComponentRender, dfpQueueDirFiles);
				}
			}
			if (opt.resources && comp.staticdir) {
				this.plugins.push(dfpResourcesComponent({
					lastBuildStart: lastBuildStart,
					onCopy: optOnResourceCopy,
					measureStats: opt.measureStatsResources,
					measureTime: opt.measureTimeResources,
					fnStats: function(x) { return x; },
					fnStatsPlugins: function(x) { return { times: x }; }
				}));
			}
			if (!opt.render) {
				this.plugins.push(dfpQueueDirFiles);
			}
		} else {
			this.plugins.push(dfpQueueDirFiles);
		}
	};
	var dfpAfterProcessComponentFiles = {
		name: 'afterProcessComponentFiles',
		pluginTimeIgnore: true,
		filter: function(file) {
			return file.componentOwner;
		},
		sync: function afterProcessComponentFiles(file) {
			var compFile = file.componentOwner;
			var comp = compFile.component;
			comp.processedFiles++;
			if (file.name === comp.html) {
				comp.htmlFile = file;
			} else if (file.name === comp.js) {
				comp.jsFile = file;
			} else if (file.name === comp.scss) {
				comp.scssFile = file;
			} else if (file.name === comp.staticdir) {
				comp.staticdirFile = file;
			} else {
				comp.otherFiles.push(file);
			}
			var pf = comp.processedFiles;
			var df = compFile.dir.files.length;
			if (comp.processedFiles === compFile.dir.files.length) {
				comp.processed = true;
				this.queue = [compFile].concat(this.queue);
			}
			// console.log(
			// 	pf+' = '+df,
			// 	// util.inspect(file,{depth:1}),
			// 	util.inspect(comp,{depth:1})
			// 	// util.inspect(compFile,{depth:1})
			// );
		}
	};
	var dfpAfterStat = {
		name: 'afterStat',
		pluginTimeIgnore: true,
		sync: function afterStat(file) {
			if (file.stat.isDirectory()) {
				if (file.name) {
					if (checkDateRender) {
						this.plugins.push(dfpAfterProcessComponentFiles);
					}
					if (!('static' === file.name && (!checkDateRender || file.componentOwner))) {
						this.plugins.push(dfpQueueDir);
					}
				} else {
					this.plugins.push(
						dfpReadDir,
						dfpIsComponent({ after: afterIsComponent })
						// dfpQueueDirFiles,
					);
				}
			} else if (file.stat.isFile()) {
				if (checkDateRender && file.name) {
					this.plugins.push(dfpAfterProcessComponentFiles);
				}
			} else {
				this.plugins.push(dfpErrorFileType);
			}
		}
	};

	var dfpErrorFileType = fnErrorFileType(function(file) {
		return 'item is not a dir or file: '+[]
			.concat(file.dir.sub || [])
			.concat(file.name || [])
			.join('/');
	});
	function fileChanged(file) {
		if (!file) return false;
		var stat = file.stat;
		var mtime = stat.mtime || stat.ctime;
		var match = (stat.isFile() && mtime && (lastBuildStart - mtime)) || false;
		return match;
	};
	var dfpCheckComponentFilesDate = {
		name: 'checkComponentFilesDate',
		pluginTimeIgnore: true,
		filter: function(file) {
			var comp = file.component;
			return comp && comp.processedFiles === file.dir.files.length;
		},
		sync: function(file) {
			var comp = file.component;
			var htmlChanged = fileChanged(comp.htmlFile);
			var jsChanged = fileChanged(comp.jsFile);
			var scssChanged = fileChanged(comp.scssFile);
			comp.modified = {
				html: htmlChanged,
				js: jsChanged,
				scss: scssChanged
			};
			if (htmlChanged <= 0 || jsChanged <= 0) {
				comp.changed = true;
				this.plugins.push(dfpComponentRender);
			} else {
				return this.SKIP;
			}
		}
	};
	var initialPlugins = [
		dfpStat,
		dfpAfterStat
	];

	dirFiles({
		path: pathRel('../src/components'),
		result: {
			list: [],
			stats: null,
			resourcesStats: null,
			resourcesTime: null
		},
		callback: function(err, result) {
			if (err) throw err;
			var listJson = JSON.stringify(result.list, null, '\t');
			var time = this.time;
			if ( !time.start ) {
				time.start = buildStart;
			}
			fs.writeFile(
				pathRel('../src/components/list.json'),
				listJson,
				function(err) {
					opt.callback(err, {
						count: result.stats,
						time: time,
						resources: {
							count: result.resourcesStats,
							time: result.resourcesTime
						}
					});
				}
			);
			//,console.log('finished');
		},
		processPlugins: [].concat(
			measureTime
				? [
						measureTime,
						measureTimeComponent
					]
				: [],
			opt.measureStats
				? [measureStatsComponent]
				: [],
			opt.measureTimeResources
				? [measureTimeResources]
				: [],
			opt.measureStatsResources
				? [measureStatsResources]
				: [],
			[
				{
					beforeFile: function(file) {
						var comp = file.component;
						var cp = comp && comp.processed;
						// console.log('processed = '+String(cp), util.inspect(file,{depth:1}));
						this.plugins = cp
							? [dfpCheckComponentFilesDate]
							: initialPlugins.slice();
					},
					beforePlugin: function() {
						var file = this.file;
						var plugin = this.plugins[this.pIndex];
						// console.log(file.dir.sub, file.name, plugin);
					},
					afterFile: function(file/*, err, skip*/) {
						var comp = file.component;
						if (comp && (!checkDateRender || comp.processed)) {
							optOnComponent && optOnComponent.apply(this, arguments);
						}
					}
				}
			]
		)
	});

}

module.exports = execute;

if ( require.main === module ) {
	var argv = minimist(process.argv.slice(2));
	var argRender = argv['render'] !== false;
	var argSkipOld = argv['skip-old'] !== false;
	var argResources = argv['resource'] !== false;
	var argPrintResult = argv['print-result'];
	buildReport.load(function(err, build) {
		execute({
			build: err ? null : reportLoad(build),
			skipOld: argSkipOld,
			render: argRender,
			resources: argResources,
			measureStats: argv['stats'] !== false,
			measureTime: argv['time'] !== false,
			measureStatsResources: argv['resource-stats'] !== false,
			measureTimeResources: argv['resource-time'] !== false,
			onComponent: function(file) {
				var comp = file && file.component;
				if (comp && argRender && (!argSkipOld || comp.changed) && !comp.logged) {
					console.log(logComponent(file));
				}
			},
			onResourceCopy: function(file, err, skip) {
				var rp = file.resourcePath;
				var isDir = file.stat && file.stat.isDirectory();
				var compFile = file.resourceComponentFile;
				var comp = compFile && compFile.component;
				if (!isDir && rp !== '.') {
					if (!comp.logged) {
						comp.logged = true;
						console.log(logComponent(compFile));
					}
					console.log(logResource(file, err, skip));
				}
			},
			callback: function(err, stats) {
				if (argPrintResult) {
					console.log(logResult(stats).join('\n'));
					// console.log(stats.resources);
					if (stats.resources) {
						console.log(logResourceResult(stats.resources).join('\n'));
					}
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
