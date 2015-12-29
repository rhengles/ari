import cr from './credentials';
import connect from './connect';
import jsonPrint from './jsonprint';
import dirName from '../dirName';
import saveSnatched from './saveSnatched';
//import savePage from './savepage';

var dir = 'jpopsuki/user/'
	, session;

function connected(s) {
	session = s;
	console.log('USER CONNECTED: '+s.user.name+' ('+s.user.id+')');
	console.log(session);
	saveSnatched(s, function(currentPage, lastPage, sum) {
		console.log('END - PAGE '+currentPage+' OF '+last+', TOTAL '+sum);
	})
}

connect(
	{ user: cr.user
	, pass: cr.pass
	, dir: dir+dirName(cr.user || '')+'/'
	, callback: connected
	});