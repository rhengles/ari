import dir from '../dir';
import converter from './converter';

var path = 'jpopsuki/data'
	, pathOut = 'jpopsuki/json'
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
				//console.log(f+':'+a[f].filter+' '+a[f].name);
				converter(
					{ pathIn: path
					, pathOut: pathOut
					, file: a[f]
					});
			}
		}
	});