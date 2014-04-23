import getLogin from './getlogin';
import postLogin from './postlogin';
import getIndex from './getindex';
import findUser from './finduser';
import cookiesParse from './cookies';
import cr from './credentials';
import jsonPrint from './jsonprint';
import sessionSave from './sessionsave';
import sessionLoad from './sessionload';
import dirName from '../dirName';
import mkDir from '../mkdir';

var session
	, cookies;

function sessionSaved() {
	console.log('SESSION SAVED: '+this.path);
}

function handleIndex(dom, res, req) {
	var user = findUser(dom);
	//console.log(dom);
	console.log('USER: '+jsonPrint(user));
	session.user = user;
	process.nextTick(function() {
		sessionSave(session, sessionSaved);
	});
}

function handleLoginPost(res, req) {
	console.log('LOGIN SUCCESSFUL');
	process.nextTick(function() {
		getIndex(cookies, handleIndex);
	});
}

function handleLoginGet(res, req) {
  cookies = res.headers['set-cookie'];
  console.log('Cookie: '+jsonPrint(cookies));
	session =
		{ cookies: cookies
		};
	cookies = cookiesParse(cookies);
	//console.log('LOGIN GET OK');
	process.nextTick(function() {
		postLogin(cr.user, cr.pass, cookies, handleLoginPost);
	});
}

function sessionVerify(dom, res, req) {
	var user = findUser(dom);
	if (user) {
		console.log('SESSION VALID: '+user.id+' '+user.name);
	} else if (cr.pass) {
		console.log('SESSION EXPIRED, RECONNECTING');
		getLogin(handleLoginGet);
	} else {
		console.log('SESSION EXPIRED, GIVE PASSWORD TO RECONNECT');
	}
}

sessionLoad(cr.user, function(s) {
	console.log('SESSION LOADED');
	//console.log(s);
	cookies = s.cookies;
	session = cookiesParse(cookies);
	process.nextTick(function() {
		getIndex(session, sessionVerify);
	});
});