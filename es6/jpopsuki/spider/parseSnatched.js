import parsePage from '../html2json/parsePage';
import parsePages from './parsePages';

//var du = hp.DomUtils;

function parseSnatched(res, req, page) {
	return (
		{ lastPage: parsePages(res.dom)
		, rows: parsePage(res.dom, page)
		});
}

export default parseSnatched;