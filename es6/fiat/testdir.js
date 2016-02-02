import fs from 'fs';
import path from 'path';
import hp from 'htmlparser2';
import dir from '../jpopsuki/dir';
import getText from '../jpopsuki/getText';

var du = hp.DomUtils;
var pathHTML = 'C:\\git\\fiat\\static2';
var reFile = /^(.*)\.html$/;

function parseHTML(path, cb) {
	var handler = new hp.DomHandler(cb);
	var parser = new hp.Parser(handler);
	var stream = fs.createReadStream(path, { encoding: 'utf8' });
	stream.pipe(parser);
}

function findHeader(dom) {
	var m = [];
	var hph = du.findAll(function(elem) {
			var attr = elem.attribs;
			return attr && attr.id === 'header-place-holder';
		}, dom);
	return hph;
}

function htmlTag(elem) {
	var at = elem.attribs || {};
	h = '<'+elem.name;
	Object.keys(at).forEach(function(k) {
		h += ' '+k+'='+JSON.stringify(at[k]);
	});
	h += '>';
	return h;
}

function next() {
	diter(function(err, file) {
		if (err) throw err;
		if (file) {
			if ( (Date.now() - last) >= 20000 ) {
				console.log(
					( file.stat.isDirectory()
					? '; <D> '
					: ';     '
					)+
					path.join(file.dir.sub, file.name)
				);
				last = Date.now();
			}
			if ( !file.stat.isFile() || !reFile.test(file.name) ) {
				setTimeout(next, 0);
				return;
			}
			var fpath = path.join(file.dir.name, file.dir.sub, file.name);
			parseHTML(fpath, function(err, dom) {
				if (err) throw err;
				var h = findHeader(dom);
				var hc = h.length;
				if ( hc ) {
					last = Date.now();
					console.log('    '+path.join(
						file.dir.sub, file.name
					));
					h.forEach(function(elem) {
						var p = elem.parent;
						var ph = p && htmlTag(p) || '';
						console.log(elem.name, ph);
					});
				//} else {
				//	console.log('-');
				}
				mapCount[hc] = (mapCount[hc] || 0) + 1;
				total += 1;
				setTimeout(next, 0);
			});
		} else {
			console.log('FINISHED - '+total+' files');
			mapCount.forEach(function(f, c) {
				f && console.log(c+' header: '+f);
			});
		}
	});
}

var diter = dir(
	//{ path: process.cwd()
	{ path: pathHTML
	//, verbose: true
	, stat: true
	, rec: function(file, dir) {
		var name = file.name;
		return name.charAt(0) != '.'
			&& name != '_jcr_content'
			&& !( name == 'dam'
				&& dir.sub == 'content' );
	  }
	});
var last;
var mapCount = [];
var total = 0;

next();