import fs from 'fs';
import dir from './dir';
import parser from './parser';
import getRows from './getRows';
import parseRow from './parseRow';

var path = 'jpopsuki/data'
	, reFile = /^(\d+)\.html$/;

dir(
	{ path: path
	, filter: function(f) {
			var m = f.match(reFile);
			return m && m[1];
		}
	, sort: function(a, b) {
			return a.filter - b.filter;
		}
	, cb: function(a) {
			for ( var f in a ) {
				console.log(f+':'+a[f].filter+' '+a[f].name);
			}
			parser(
				{ path: [path, a[0].name].join('/')
				, cb: function(dom) {
						//console.log(dom);
						var r = getRows(dom);
						console.log('ROWS FOUND: '+r.length);
						console.log(parseRow(r[0]));
					}
				});
		}
	});