//,var fs = require('fs');
var node_path = require('path');
var dirFiles = require('dir-files');
var copy = require('./includes/copy');

function pathRelBase(base, p) {
	return node_path.join(base, p).replace(/\\/g, '/');
}
function pathRel(p) {
	return pathRelBase(__dirname, p);
}

var dirSrc = pathRel('../src/js/vendor');
var dirDest = pathRel('../web/js');
var ext = '.js';
var extLen = ext.length;
var dfp = dirFiles.plugins;

dirFiles({
	path: dirSrc,
	plugins: [
		dfp.stat(),
		dfp.queueDir(),
		dfp.readDir(),
		dfp.queueDirFiles(),
		function(file, callback) {
			var name = file.name;
			var diffLen = name.length - extLen;
			if (name && file.stat.isFile() && diffLen >= 0 && name.substr(diffLen) === ext) {
				var pathDest = pathRelBase(dirDest, pathRelBase(file.dir.sub, name));
				copy({
					input: file.fullpath,
					output: pathDest,
					callback: function(err) {
						console.log(
							(err ? '(ERROR) ' : '- ')+
							node_path.relative(dirDest, pathDest)
						);
						callback(err);
					}
				});
			} else {
				callback();
			}
		}
	],
	callback: function(err) {
		if (err) throw err;
		//,console.log('finished');
	}
});
