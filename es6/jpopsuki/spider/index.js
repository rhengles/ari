import cr from './credentials';
import connect from './connect';
import jsonPrint from './jsonprint';
import dirName from '../dirName';
import saveSnatched from './saveSnatched';
import saveArtists from './saveArtists';
import saveArtist from './saveArtist';
//import savePage from './savepage';
import loadArtists from './loadArtists';

var dir = 'jpopsuki/user/'
	, session;

function connected(s) {
	session = s;
	console.log('USER CONNECTED: '+s.user.name+' ('+s.user.id+')');
	console.log(session);
	//saveSnatched(s, function(currentPage, lastPage, sum) {
	//saveArtists(s, function(currentPage, lastPage, sum) {
	//	console.log('END - PAGE '+currentPage+' OF '+lastPage+', TOTAL '+sum);
	//})
	//saveArtist('285', s, function(artist) {
	//saveArtist('412', s, function(artist) {
	//saveArtist('518', s, function(artist) {
	//saveArtist('16729', s, function(artist) {
	//	console.log(artist);
	//});
	loadArtists(function(json, page, nextPage) {
		function nextArtist() {
			if ( !json[row] ) {
				return setTimeout(nextPage, 2000);
			}
			saveArtist(json[row].info.id, s, function(artist) {
				row += 1;
				console.log('- '+
					(row<10?'0':'')+row+
					' <'+artist.info.id+
					'> '+artist.info.name);
				setTimeout(nextArtist, 2000);
			});
		}
		var row = 0;
		console.log('');
		console.log('ARTISTS PAGE '+page);
		if ( page < 14 ) {
			return nextPage();
		}
		console.log('');
		nextArtist();
	}, function() {
		console.log('FINISHED');
	});
}

connect(
	{ user: cr.user
	, pass: cr.pass
	, dir: dir+dirName(cr.user || '')+'/'
	, callback: connected
	});