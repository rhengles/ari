/*eslint no-console:0*/

var fs = require('fs');
var node_path = require('path');
var nunjucks = require('nunjucks');
var dirFiles = require('dir-files');
var openDir = require('./includes/open-dir');

function pathRel(p) {
	return node_path.join(__dirname, p);
}

var path = pathRel('../src/pages');
var pathWeb = pathRel('../web');
var pagesExt = /\.(cshtml|html)$/i;
//var extLen = pagesExt.length;
var loader = new nunjucks.FileSystemLoader(path);
var env = new nunjucks.Environment(loader);
var total = 0;

function renderTemplate(name, cb) {
	var content;
	try {
		content = env.render(name);
	} catch(err) {
		return cb(err);
	}

	openDir(pathWeb, function(err) {
		if (err) return cb(err);
		return saveFilePaths(
			[
				{
					base: pathWeb,
					path: [],
					name: name
				}
			],
			content,
			cb
		);
	});

}

function saveFilePaths(paths, content, cb) {
	if ( !paths.length ) return cb();
	var item = paths.shift();
	openDir.array(item.base, item.path.slice(), function(err) {
		if (err) return cb(err);
		var p = item.path.join(node_path.sep);
		var p2 = node_path.join(item.base, p, item.name);
		//console.log('{sfp}', item, p, p2);
		return fs.writeFile(
			p2,
			content,
			function(err) {
				if (err) return cb(err);
				return saveFilePaths(paths, content, cb);
			}
		);
	});
}

function skipSpecialFiles(file) {
	var char = file.name[0];
	var skip = '.' === char || '_' === char;
	return skip ? this.SKIP : null;
}
function detectPage(file) {
	var name = file.name;
	var stat = file.stat;
	var isFile = stat.isFile();
	var isPage, skip;//, diffLen;
	if (isFile) {
		//diffLen = name.length - extLen;
		//isPage = diffLen >= 0 && name.substr(diffLen) === pagesExt;
		isPage = pagesExt.test(name);
		file.isPage = isPage;
		skip = !isPage;
	}
	return skip ? this.SKIP : null;
}
function renderPage(file, callback) {
	var ctx = this;
	var name;
	if (file.isPage) {
		name = node_path.join(file.dir.sub, file.name);
		renderTemplate(name, function(err) {
			console.log((err ? 'error on ' : 'page saved ') + name);
			total += 1;
			callback(err || ctx.SKIP);
		});
	} else {
		callback();
	}
}

var dfp = dirFiles.plugins;

dirFiles({
	path: path,
	plugins: [
		skipSpecialFiles,
		dfp.stat(),
		detectPage,
		renderPage,
		dfp.queueDir(),
		dfp.readDir(),
		dfp.queueDirFiles(),
	],
	callback: function(err) {
		console.log('FINISHED - ' + total + ' files');
		//if (err) throw err;
	}
});
