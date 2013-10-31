import hp from 'htmlparser2';
import getText from './getText';
import parseUrl from './parseUrl';

var du = hp.DomUtils;

function parseColType(td) {
	var a = du.findOne(function(elem) {
				return (elem.name === 'a');
			}, td.children)
		, link = parseUrl(a);
	return (
		{ id: link.query['filter_cat[2]']
		, name: getText(a)
		});
}

export default parseColType;