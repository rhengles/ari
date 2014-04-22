import getLogin from './getlogin';
import postLogin from './postlogin';
import getIndex from './getindex';
import findUser from './finduser';
import cookies from './cookies';
import cr from './credentials';
import jsonPrint from './jsonprint';

var session;

function handleIndex(dom, res, req) {
	var user = findUser(dom);
	//console.log(dom);
	console.log('USER ID: '+jsonPrint(user));
}

function handleLoginPost(res, req) {
	console.log('LOGIN SUCCESSFUL');
	process.nextTick(function() {
		getIndex(session, handleIndex, true);
	});
}

function handleLoginGet(res, req) {
  var c = res.headers['set-cookie'];
  console.log('Cookie: '+jsonPrint(c));
	session = cookies(c);
	//console.log('LOGIN GET OK');
	process.nextTick(function() {
		postLogin(cr.user, cr.pass, session, handleLoginPost);
	});
}

getLogin(handleLoginGet);
