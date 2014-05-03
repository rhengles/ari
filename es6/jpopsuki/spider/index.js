import cr from './credentials';
import connect from './connect';
import jsonPrint from './jsonprint';
import dirName from '../dirName';
//import savePage from './savepage';

var dir = 'jpopsuki/user/'
	, session;

function connected(s) {
	session = s;
	console.log('USER CONNECTED: '+s.user.name+' ('+s.user.id+')');
	console.log(session);
//	savePage(
//		{ url: s.user.href.replace(/^(?!\/)/, '/')
//		, file: 
}

connect(
	{ user: cr.user
	, pass: cr.pass
	, dir: dir+dirName(cr.user)+'/'
	, callback: connected
	});