import request from './requestjps';

function getArtist(id, cookies, cb, log) {
	var opt =
      { path: '/artist.php?id='+id
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

export default getArtist;