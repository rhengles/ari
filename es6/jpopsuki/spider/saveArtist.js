import getArtist from './getartist';
import parseArtist from './parseArtist';
import saveJson from '../saveJson';
import mkDir from '../mkdir';

function saveArtist(id, session, cb) {
	//console.log('saveArtist '+id);
	var path = getArtistDir(id);
	var name = path.pop();
	//console.log('getArtistDir '+path+' - '+name);
	getArtist(id, session.cookies, function(res, req) {
		//console.log('getArtist '+id);
		var result = parseArtist(res, req, id);
		//console.log('parseArtist '+result);
		mkDir.rec(path, function(err) {
			if (err) throw err;
			//console.log('mkDir artist '+path);
			path = { dir: path.join('/')+'/', name: name };
			saveJson(path, result, function() {
				//console.log('saveJson artist');
				cb(result);
			});
		});
	});
}

function getArtistDir(id) {
	var part = 3;
	var path = [];
	id = String(id);
	var len = id.length;
	//console.log('dir '+len+' '+id);
	if ( !len ) throw new Error('Empty artist id');
	while (len) {
		var cpart = Math.min(part, len);
		var ipart = len-cpart;
		cpart = id.substr( ipart, cpart );
		id = id.substr( 0, ipart );
		len = id.length;
		//console.log('dir '+cpart+' '+len+' '+id);
		while ( cpart.length < part ) {
			cpart = '0'+cpart;
		}
		path.unshift( cpart );
	}
	//console.log('dir '+path);
	path.unshift( path.length );
	var pathFirst = 'jpopsuki/json/artist';
	var pathLast = path.pop()+'.json';
	path.unshift(pathFirst);
	path.push(pathLast);
	return path;
}

export default saveArtist;