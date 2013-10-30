import http from 'http';
import ua from './useragent';

function getLogin(cb, err, proxy) {
  var opt =
      { host: 'jpopsuki.eu'
      , path: '/login.php'
      , method: 'GET'
      , headers:
        { 'User-Agent': ua
        }
      }
    , req = http.request( proxy ? proxy(opt) : opt, function(res) {
        var body = '';
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
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

  req.end();
}

export default getLogin;