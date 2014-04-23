import getLogin from './getlogin';
import postLogin from './postlogin';
import getIndex from './getindex';
import findUser from './finduser';
import cookiesParse from './cookies';
import cr from './credentials';
import jsonPrint from './jsonprint';
import sessionSave from './sessionsave';
import dirName from '../dirName';
import mkDir from '../mkdir';

var cookies
	, session;

function sessionSaved() {
	console.log('SESSION SAVED: '+this.path);
}

function handleIndex(dom, res, req) {
	var user = findUser(dom);
	//console.log(dom);
	console.log('USER ID: '+jsonPrint(user));
	process.nextTick(function() {
		sessionSave(
			{ user: user
			, cookies: cookies
			}
		, sessionSaved);
	});
}

function handleLoginPost(res, req) {
	console.log('LOGIN SUCCESSFUL');
	process.nextTick(function() {
		getIndex(session, handleIndex);
	});
}

function handleLoginGet(res, req) {
  cookies = res.headers['set-cookie'];
  console.log('Cookie: '+jsonPrint(cookies));
	session = cookiesParse(cookies);
	//console.log('LOGIN GET OK');
	process.nextTick(function() {
		postLogin(cr.user, cr.pass, session, handleLoginPost);
	});
}

getLogin(handleLoginGet);
