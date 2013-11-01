import getRows from './getRows';
import parseRow from './parseRow';

function parseRowPage(page) {
	return function (val, key) {
		return parseRow(val, key, page);
	};
}

function parsePage(dom, page) {
	var rows = getRows(dom);
	console.log('PAGE '+page+': '+rows.length+' ROWS FOUND');
	return rows.map(parseRowPage(page));
}

export default parsePage;