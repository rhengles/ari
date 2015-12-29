import request from './requestjps';

function getSnatched(userid, page, cookies, cb, log) {
	var opt =
      //{ path: '/torrents.php?page='+page+'&order_by=s3&order_way=DESC&type=snatched&userid='+userid+'&disablegrouping=1'
      { path: '/ajax.php?section=torrents&page='+page+'&order_by=s3&order_way=DESC&type=snatched&userid='+userid+'&disablegrouping=1'
			, head:
				{ 'Cookie': cookies
				, 'Referer': 'http://jpopsuki.eu/torrents.php?page='+page+'&order_by=s3&order_way=DESC&type=snatched&userid='+userid+'&disablegrouping=1'
				}
			, getBody: false
			, getDom: true
			, done: cb
			, log: log
      }
		, req = request(opt);
	return req;
}

export default getSnatched;