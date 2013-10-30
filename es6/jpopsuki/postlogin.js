import http from 'http';
import qs from 'querystring';
import ua from './useragent';

function postLogin(user, pass, cookies, proxy) {
  var opt =
      { host: 'jpopsuki.eu'
      , path: '/login.php'
      , method: 'POST'
      , headers:
        { 'User-Agent': ua
        , Cookie: cookies
        }
      }
    , req = http.request( proxy ? proxy(opt) : opt, function(res) {
          console.log('STATUS: ' + res.statusCode);
          console.log('HEADERS: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
          });
        }
      )
    , post = qs.stringify(
        { username: user
        , password: pass
        , login: 'Log In!'
        } );

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });

  console.log('POST: '+post);
  req.write(post);
  req.end();
}

export default postLogin;