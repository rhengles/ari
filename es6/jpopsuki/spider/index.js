import http from 'http';
import getLogin from './getlogin';
import postLogin from './postlogin';
import proxy from './proxy';

getLogin(function(res, req) {
  var cookies = res.headers['set-cookie'];
  cookies = cookies.replace(/; path=\/$/, '');
  console.log('Cookie: '+JSON.stringify(cookies));
  postLogin(/*'username'*/, /*'password'*/, cookies, proxy);
}, void 0, proxy);
