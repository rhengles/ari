import fs from 'fs';
import dir from '../dir';
import All from '../all';
import loadJson from './loadJson';
import SaveArtist from './saveArtist';

function arr2map(a) {
	var m = {};
	for ( var i = 0, ii = a.length; i < ii; i++ ) {
		m[a[i].toLowerCase()] = true;
	}
	return m;
}

var pathJson = 'jpopsuki/json'
	, pathLib = 'jpopsuki/lib'
	, reFile = /^(\d+)\.json$/
	, allDir = new All
	, cbJson = allDir.getCb('json')
	, cbLib  = allDir.getCb('lib')
	, sa = new SaveArtist;

sa.path = pathLib;

allDir.then(function() {
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
		sa.then(function() {
			console.log('Done');
			console.log(this.count());
		});
	});
});

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

dir(
	{ path: pathLib
	, cb: cbLib
	});