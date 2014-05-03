import request from './requestjps';

function getIndex(cookies, cb, log, getBody) {
	var opt =
      { path: '/index.php'
			, head:
				{ 'Cookie': cookies
				, 'Referer': 'http://jpopsuki.eu/login.php'
				}
			, getBody: getBody
			, getDom: true
			, done: cb
			, log: log
      }
		, req = request(opt);
	return req;
}

export default getIndex;