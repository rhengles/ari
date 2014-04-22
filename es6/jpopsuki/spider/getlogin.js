import http from 'http';
import ua from './useragent';
import headers from './headers';
import host from './host';

function getLogin(cb, err, proxy) {
  var opt =
      { host: host
      , path: '/login.php'
      , method: 'GET'
      , headers: headers.extend(
        { 'User-Agent': ua
				, 'Referer': 'http://jpopsuki.eu/index.php'
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
      } );

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
    err && err(e, req);
  });

	console.log('-=-=-= GETTING LOGIN =-=-=-');
  req.end();
}

export default getLogin;