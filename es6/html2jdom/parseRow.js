import hp from 'htmlparser2';
import colType from './parseColType';
import colCover from './parseColCover';
import colInfo from './parseColInfo';

var du = hp.DomUtils;

function parseRow(row) {
	var tds = du.findAll(function(elem) {
				return (elem.name === 'td');
			}, row.children);
	return (
		{ type: colType(tds[0])
		, cover: colCover(tds[1])
		, info: colInfo(tds[2])
		});
}

export default parseRow;