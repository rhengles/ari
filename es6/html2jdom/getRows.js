import hp from 'htmlparser2';

var du = hp.DomUtils;

function getRows(dom) {
	return du.findAll(function(elem) {
		return (elem.name === 'tr')
			&& (elem.attribs)
			&& (elem.attribs['class'] === 'torrent');
	}, dom);
}

export default getRows;