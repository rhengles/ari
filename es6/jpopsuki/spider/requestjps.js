import Request from './request';
import ua from './useragent';
import headers from './headers';
import host from './host';
import proxy from './proxy';
import jsonPrint from './jsonprint';

var requestJPS = function(opt) {
	var done = opt.done;
	opt.head || (opt.head = {});
	opt.head['User-Agent'] = ua;
	opt =
		{ req:
			{ host: host
			, path: opt.path
			, method: opt.method || 'GET'
			, headers: headers.extend(opt.head)
			}
		, proxy: proxy
		, body: opt.body
		, getBody: opt.getBody
		, getDom: opt.getDom
		, beforeLoad: opt.log
			? function() {
					var opt = this.opt;
					console.log('-=-=-= '+this.info()+' =-=-=-');
					console.log('HEADERS: '+jsonPrint(opt.req.headers));
					opt.body && console.log('BODY: ' +
						( opt.bodyObj
						? jsonPrint(opt.bodyObj)
						: opt.body
						) );
				}
			: null
		, onData: opt.onData
		, done: opt.log
			? function(res, req) {
					console.log('STATUS: ' + res.statusCode);
					console.log('HEADERS: ' + jsonPrint(res.headers));
					opt.getBody && console.log('BODY: ' + res.body.substr(0, 1200));
					return done.apply(this, arguments);
				}
			: done
		, fail: opt.fail
		};
	return new Request(opt);
};

export default requestJPS;