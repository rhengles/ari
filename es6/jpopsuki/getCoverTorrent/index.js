import fs from 'fs';
import dir from '../dir';
import All from '../all';
import loadJson from './loadJson';
import SaveArtist from './saveArtist';

function arr2map(a) {
	var m = {};
	for ( var i = 0, ii = a.length; i < ii; i++ ) {
		m[a[i]] = true;
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
	var json = this.json[0]
		, lib = arr2map(this.lib[0])
		, allPages = new All;
	sa.folders = lib;
	json.forEach(function(json, index) {
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
		console.log('> done');
		console.log(sa);
		sa.then(function() {
			console.log('> then');
			console.log(this);
		});
	});
	//for ( var f in a ) {
	//	console.log(f+':'+a[f].filter+' '+a[f].name);
	//}
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