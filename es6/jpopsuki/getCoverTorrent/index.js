import fs from 'fs';
import dir from '../dir';
import All from '../all';
import loadJson from '../loadJson';
import SaveArtist from './saveArtist';
import saveCover from './saveCover';

function arr2map(a) {
	var m = {};
	for ( var i = 0, ii = a.length; i < ii; i++ ) {
		m[a[i]/*.toLowerCase()*/] = true;
	}
	return m;
}

console.log('ct 0');

var pathJson = 'jpopsuki/json/snatched'
	, pathLib = 'jpopsuki/lib'
	, reFile = /^(\d+)\.json$/
	, allDir = new All
	, cbJson = allDir.getCb('json')
	, cbLib  = allDir.getCb('lib')
	, sa = new SaveArtist;

sa.path = pathLib;
sa.onFolder(saveCover);

console.log('ct 1');

allDir.then(function() {
console.log('ct 5');

	var jsonFile = this.json[0]
		, lib = this.lib[0]
		, allPages = new All;
  //sa.log = true;
  lib = arr2map(lib);
	sa.folders = lib;
	jsonFile.forEach(function(json, index) {
		var then = allPages.getCb(index);
		loadJson(
			{ path: [pathJson, json.name].join('/')
			, cb: function(json) {
					json.forEach(sa.save.bind(sa));
					then();
				}
			});
	});
	allPages.then(function() {
console.log('ct 6');

		sa.then(function() {
			console.log('Done');
			console.log(this.count());
		});
	});
});

console.log('ct 2');

dir(
	{ path: pathJson
	, filter: function(f) {
			var m = f.match(reFile);
			return m && m[1];
		}
	, sort: function(a, b) {
			return a.filter - b.filter;
		}
	, cb: cbJson
	});

console.log('ct 3');

dir(
	{ path: pathLib
	, cb: cbLib
	});

console.log('ct 4');
