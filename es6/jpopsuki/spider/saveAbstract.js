import saveJson from '../saveJson';

function saveAbstract(domain, session, cb) {
	function next() {
		getPage(domain, session, currentPage, function(last, count) {
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

function getPage(domain, session, page, cb) {
	domain.get(page, session.cookies, function(res, req) {
		var result = domain.parse(res, req, page);
		var path = { dir: domain.dir, name: page+'.json' };
		saveJson(path, result.rows, function() {
			cb(result.lastPage, result.rows.length);
		});
	});
}

export default saveAbstract;