import getLogin from './getlogin';
import postLogin from './postlogin';
import getIndex from './getindex';
import findUser from './finduser';
import cookiesParse from './cookies';
import jsonPrint from './jsonprint';
import sessionSave from './sessionsave';
import sessionLoad from './sessionload';
import dirName from '../dirName';
import mkDir from '../mkdir';

function connect(o) {
	if ( !o.user ) {
		console.log('ERROR: NO USER');
	} else {
		sessionLoad(o.user, function(s) {
			if (s) {
				o.session = s;
				sessionLoaded(o);
			} else {
				reconnect(o);
			}
		});
	}
}

function connected(o) {
	o.callback.call(null, o.session);
}

function decodeSession(s) {
	return (
		{ cookies: cookiesParse(s.cookies)
		, user: s.user
		});
}

function encodeSession(s) {
	return (
		{ cookies: s.raw
		, user: s.user
		});
}

function newSession(c) {
	return (
		{ cookies: cookiesParse(c)
		, raw: c
		});
}

function acceptSession(s) {
	return (
		{ cookies: s.cookies
		, user: s.user
		});
}

function setUserSession(t, user) {
	t.user = user;
	return t;
}

function sessionLoaded(o) {
	console.log('SESSION LOADED');
	var s = decodeSession(o.session);
	o.session = s;
	process.nextTick(function() {
		getIndex(s.cookies, function(dom, res, req) {
			sessionVerify(dom, res, req, o);
		});
	});
}

function handleIndex(dom, res, req, o) {
	var user = findUser(dom)
		, s = o.session;
	//console.log(dom);
	if ( !user || !user.id || !user.name ) {
		console.log('USER NOT FOUND: '+jsonPrint(user));
	} else {
		console.log('LOGIN SUCCESSFUL');
		//console.log('USER: '+jsonPrint(user));
		s = setUserSession(s, user);
		process.nextTick(function() {
			sessionSave(encodeSession(s), function() {
				console.log('SESSION SAVED');//: '+this.path);
				o.session = acceptSession(s);
				connected(o);
			});
		});
	}
}

function handleLoginPost(res, req, o) {
	process.nextTick(function() {
		getIndex(o.session.cookies, function(dom, res, req) {
			handleIndex(dom, res, req, o);
		});
	});
}

function handleLoginGet(res, req, o) {
  var c = res.headers['set-cookie']
		, s = newSession(c);
	o.session = s;
  //console.log('LOGIN GET OK');
	process.nextTick(function() {
		postLogin(o.user, o.pass, s.cookies, function(res, req) {
			handleLoginPost(res, req, o);
		});
	});
}

function reconnect(o) {
	if (o.pass) {
		console.log('CONNECTING');
		getLogin(function(res, req) {
			handleLoginGet(res, req, o);
		});
	} else {
		console.log('GIVE PASSWORD TO RECONNECT');
	}
}

function sessionVerify(dom, res, req, o) {
	var user = findUser(dom)
		, suser = o.session.user;
	if (user) {
		if ( suser.id == user.id && suser.name == user.name ) {
			console.log('SESSION ACTIVE');
			process.nextTick(function() {
				connected(o);
			});
		} else {
			console.log('SESSION USER CONFLICT: '+suser.id+' '+suser.name);
		}
	} else {
		console.log('SESSION EXPIRED');
		reconnect(o);
	}
}

export default connect;