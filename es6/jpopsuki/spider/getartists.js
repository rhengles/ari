import request from './requestjps';

function getArtists(page, cookies, cb, log) {
	var opt =
      { path: '/ajax.php?section=artists&page='+page+'&order_by=s1&order_way=ASC'
			, head:
				{ 'Cookie': cookies
				, 'Referer': 'http://jpopsuki.eu/artists.php'
				}
			, getBody: false
			, getDom: true
			, done: cb
			, log: log
      }
		, req = request(opt);
	return req;
}

export default getArtists;