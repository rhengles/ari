import getLogin from './getlogin';
import postLogin from './postlogin';
import cookies from './cookies';
import cr from './credentials';
import jsonPrint from './jsonprint';

function handleLoginPost(res, req) {
	console.log('LOGIN POST OK');
}

function handleLoginGet(res, req) {
  var c = res.headers['set-cookie'];
  console.log('Cookie: '+jsonPrint(c));
	console.log('LOGIN GET OK');
	process.nextTick(function() {
		postLogin(cr.user, cr.pass, cookies(c), handleLoginPost, true);
	});
}

getLogin(handleLoginGet);
