var node_path = require('path');
var copyRecursive = require('../copy-recursive');
//,var dirFiles = require('dir-files');
//,var copy = require('../copy');
//,var openDir = require('../open-dir');

function pathRel(p) {
	return node_path.join(__dirname, p);
}

var baseDest = pathRel('../../../web/components');

//,var dfp = dirFiles.plugins;

module.exports = function fnDirResourcesComponent(opt) {
	return {
		name: 'dirResourcesComponent',
		filter: function(file) {
			var comp = file.component;
			return comp && comp.staticdir;
		},
		async: function dirResourcesComponent(compFile, callback) {
			var ctx = this;
			var comp = compFile.component;
			copyRecursive({
				path: node_path.join(compFile.fullpath, 'static'),
				measureStats: opt.measureStats,
				measureTime: opt.measureTime,
				fnStats: opt.fnStats,
				fnStatsPlugins: opt.fnStatsPlugins,
				filterFile: opt.lastBuildStart && function(file) {
					var stat = file.stat;
					var mtime = stat.mtime || stat.ctime;
					return stat.isFile() && mtime && mtime >= opt.lastBuildStart;
				},
				destpath: function(file) {
					var resourcePath = node_path.join(file.dir.sub, file.name);
					var destPath = node_path.join(baseDest, comp.path, resourcePath);
					file.resourcePath = resourcePath;
					file.resourceComponentFile = compFile;
					return destPath;
				},
				onCopy: opt.onCopy,
				getInvalidFileTypeMessage: function(file) {
					var rp = file.resourcePath;
					return 'component '+comp.path+': resource is not a dir or file: '+rp;
				},
				callback: function(err, result) {
					comp.resourcesStats = result.count;
					comp.resourcesTime = result.time;
					callback(err);
				}
			});
		}
	};
}
