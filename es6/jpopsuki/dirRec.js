import dir from '../dir';

var pathJson = 'jpopsuki/json/artists';
var reFile = /^(\d+)\.json$/;

function dirRec(cbPage, cbDone) {

dir(
	{ path: pathJson
	, filter: function(f) {
			var m = f.match(reFile);
			return m && m[1];
		}
	, sort: function(a, b) {
			return a.filter - b.filter;
		}
	, cb: function(fileList) {
			function next() {
				if ( !fileList.length ) {
					return cbDone();
				}
				var file = fileList.shift();
				//console.log(file);
				loadJson(
					{ path: [pathJson, file.name].join('/')
					, cb: function(json) {
							cbPage(json, file.filter, next);
						}
					});
			}
			next();
		}
	});
}

export default loadArtists;