import cr from './credentials';
import connect from './connect';
import jsonPrint from './jsonprint';
import dirName from '../dirName';
import saveSnatched from './saveSnatched';
import saveArtists from './saveArtists';
import saveArtist from './saveArtist';
//import savePage from './savepage';

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
	saveArtist('16729', s, function(artist) {
		console.log(artist);
	});
}

connect(
	{ user: cr.user
	, pass: cr.pass
	, dir: dir+dirName(cr.user || '')+'/'
	, callback: connected
	});