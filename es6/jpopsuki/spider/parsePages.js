import hp from 'htmlparser2';

var du = hp.DomUtils;
var rePage = /^[^?]*\?[^#]*page=([0-9]+).*$/i;

function parsePages(dom) {
	var linkbox = du.findOne(function(elem) {
		return (elem.name === 'div')
			&& (elem.attribs)
			&& (elem.attribs['class'] === 'linkbox');
	}, dom);
	var lastPage = du.findAll(function(elem) {
		return (elem.name === 'a')
			&& (elem.attribs)
			&& (elem.attribs['href']);
	}, linkbox.children).pop();
	lastPage = lastPage.attribs.href.match(rePage);
	return lastPage && parseInt(lastPage[1], 10);
}

export default parsePages;