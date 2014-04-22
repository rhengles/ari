import http from 'http';
import getLogin from './getlogin';
import postLogin from './postlogin';
import proxy from './proxy';
import cookies from './cookies';
import cr from './credentials';

getLogin(function(res, req) {
  var c = res.headers['set-cookie'];
  //cookies = cookies.replace(/; path=\/$/, '');
  console.log('Cookie: '+JSON.stringify(c));
	process.nextTick(function() {
		postLogin(cr.user, cr.pass, cookies(c), void 0); //proxy);
	});
}, void 0, void 0); //proxy);
