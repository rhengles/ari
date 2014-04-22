import http from 'http';
import qs from 'querystring';
import ua from './useragent';
import headers from './headers';
import host from './host';

function postLogin(user, pass, cookies, proxy, cb) {
  var post = qs.stringify(
        { username: user
        , password: pass
        , login: 'Log In!'
        } )
    , opt =
      { host: host
      , path: '/login.php'
      , method: 'POST'
      , headers: headers.extend(
        { 'Cache-Control': 'max-age=0'
				, 'Content-Type': 'application/x-www-form-urlencoded'
				, 'Content-Length': Buffer.byteLength(post)
        , 'Cookie': cookies
				, 'Referer': 'http://jpopsuki.eu/login.php'
				, 'User-Agent': ua
        })
			, agent: http.globalAgent
      }
    , req = http.request( proxy ? proxy(opt) : opt, function(res) {
					var body = '';
          console.log('STATUS: ' + res.statusCode);
          console.log('HEADERS: ' + JSON.stringify(res.headers, void 0, 2));
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
						body += chunk;
          });
					cb && res.on('end', function() {
						res.body = body;
						cb(res, req);
					});
        }
      );

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });

	console.log('-=-=-= POSTING LOGIN =-=-=-');
  console.log('POST: '+post);
  //console.log('COOKIES: '+cookies);
  console.log('HEADERS: '+JSON.stringify(opt.headers, void 0, 2));
  req.write(post);
  req.end();
}

export default postLogin;