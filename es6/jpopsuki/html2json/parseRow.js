import hp from 'htmlparser2';
import colType from './parseColType';
import colCover from './parseColCover';
import colInfo from './parseColInfo';
import colFiles from './parseColFiles';
import colSnatched from './parseColSnatched';
import colSize from './parseColSize';
import getText from '../getText';

var du = hp.DomUtils;

function parseRow(row, index, page) {
	var tds = du.findAll(function(elem) {
				return (elem.name === 'td');
			}, row.children)
		, info = colInfo(tds[2]);
	return (
		{ type: colType(tds[0])
		, cover: colCover(tds[1], info, index, page)
		, info: info
		, files: colFiles(tds[3])
		, snatched: colSnatched(tds[4])
		, size: colSize(tds[5])
		, snatches: getText(tds[6])
		, seeders: getText(tds[7])
		, leechers: getText(tds[8])
		});
}

export default parseRow;