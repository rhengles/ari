import cr from './credentials';
import connect from './connect';
import jsonPrint from './jsonprint';

var session;

function connected(s) {
	session = s;
	console.log('USER CONNECTED: '+s.user.name+' ('+s.user.id+')');
	console.log(session);
}

connect(
	{ user: cr.user
	, pass: cr.pass
	, callback: connected
	});