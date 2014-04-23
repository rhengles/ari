import hp from 'htmlparser2';
import request from './requestjps';

function getIndex(cookies, cb, log, getBody) {
	var body = ''
		, handler = new hp.DomHandler(function(err, dom) {
				if ( err ) {
					console.log('Error parsing '+req.info());
					console.log(err);
					return;
				}
				cb.call(req, dom, response, req);
			})
		, parser = new hp.Parser(handler)
		, opt =
      { path: '/index.php'
			, head:
				{ 'Cookie': cookies
				, 'Referer': 'http://jpopsuki.eu/login.php'
				}
			, onData: function(chunk) {
					parser.write(chunk);
					getBody && (body += chunk);
				}
			, done: function(res, req) {
					getBody && (res.body = body);
					response = res;
					parser.done();
				}
			, log: log
      }
		, req = request(opt)
		, response;
	return req;
}

export default getIndex;