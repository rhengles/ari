import getSnatched from './getsnatched';
import parseSnatched from './parseSnatched';
import saveJson from '../saveJson';

function saveSnatched(session, cb) {
	function next() {
		getPage(session, currentPage, function(last, count) {
			if ( null == lastPage ) {
				lastPage = last || 1;
			}
			sum += count || 0;
			if ( count && currentPage < lastPage ) {
				currentPage += 1;
				return setTimeout(next, 2000);
			}
			return cb(currentPage, lastPage, sum);
		});
	}
	var lastPage;
	var currentPage = 1;
	var sum = 0;
	next();
}

function getPage(session, page, cb) {
	getSnatched(session.user.id, page, session.cookies, function(res, req) {
		var result = parseSnatched(res, req, page);
		saveJson('jpopsuki\\json\\snatched\\'+page+'.json', result.rows, function() {
			cb(result.lastPage, result.rows.length);
		});
	});
}

export default saveSnatched;