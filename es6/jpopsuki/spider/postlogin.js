import request from './requestjps';

function postLogin(user, pass, cookies, cb, log) {
	var opt =
			{ method: 'POST'
			, path: '/login.php'
			, head:
				{ 'Cache-Control': 'max-age=0'
				, 'Cookie': cookies
				, 'Referer': 'http://jpopsuki.eu/login.php'
				}
			, body:
				{ username: user
				, password: pass
				, login: 'Log In!'
				}
			, done: cb
			, log: log
			};
	return request(opt);

/*    , opt =
    , req = http.request( proxy ? proxy(opt) : opt, function(res) {
					var body = '';
          console.log('STATUS: ' + res.statusCode);
          console.log('HEADERS: ' + jsonPrint(res.headers));
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
  console.log('HEADERS: '+jsonPrint(opt.headers));
  req.write(post);
  req.end(); // */
}

export default postLogin;