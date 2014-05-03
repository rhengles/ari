import hp from 'htmlparser2';
import getText from '../getText';

var du = hp.DomUtils
	, reID = /user\.php\?id=([^&=?#;]+)/;

function findUser(dom) {
	var id, name, href;
	du.find(function(elem) {
		var m, c
			, found = elem
				&& (elem.name === 'a')
				&& (elem.attribs)
				&& (c = elem.attribs['class'])
				&& (c.indexOf('username') != -1);
		if (found) {
			m = elem.attribs.href.match(reID);
			found = !!m;
		}
		if (found) {
			id = m[1];
			name = getText(elem);
			href = elem.attribs.href;
		}
		return found;
	}, dom, true, 1);
	return ( id
		? { id: id
			, name: name
			, href: href
			}
		: null);
}

export default findUser;