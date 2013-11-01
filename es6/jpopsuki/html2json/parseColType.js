import hp from 'htmlparser2';
import getText from './getText';
import parseUrl from './parseUrl';

var du = hp.DomUtils;

function getFilterCat(link) {
	var m = link.query.match(/filter_cat%5B([^\%]*)%5D/);
	return m ? m[1] : link.query;
}

function parseColType(td) {
	var a = du.findOne(function(elem) {
				return (elem.name === 'a');
			}, td.children)
		, link = parseUrl(a, false);
	return (
		{ id: getFilterCat(link)
		, name: getText(a)
		});
}

export default parseColType;