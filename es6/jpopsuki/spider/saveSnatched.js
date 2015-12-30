import getSnatched from './getsnatched';
import parseSnatched from './parseSnatched';
import saveAbstract from './saveAbstract';

function domainSnatched(userid) {
	return (
		{ get: function(page, cookies, cb, log) {
				return getSnatched(userid, page, cookies, cb, log);
			}
		, parse: parseSnatched
		, dir: 'jpopsuki/json/snatched/'
		});
}

function saveSnatched(session, cb) {
	saveAbstract(domainSnatched(session.user.id), session, cb);
}

export default saveSnatched;