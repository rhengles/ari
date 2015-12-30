import hp from 'htmlparser2';

var du = hp.DomUtils;
var rePage = /^[^?]*\?[^#]*page=([0-9]+).*$/i;

function parsePages(dom) {
	var linkbox = du.findAll(function(elem) {
		return (elem.name === 'div')
			&& (elem.attribs)
			&& (elem.attribs['class'] === 'linkbox');
	}, dom);
	var lastPage;
	linkbox.forEach(function(linkbox) {
		if (lastPage) return;
		var lp = du.findAll(function(elem) {
			return (elem.name === 'a')
				&& (elem.attribs)
				&& (elem.attribs['href']);
		}, linkbox.children).pop();
		lp = lp && lp.attribs.href.match(rePage);
		if (lp) lastPage = lp[1];
	});
	return lastPage && parseInt(lastPage, 10);
}

export default parsePages;