import hp from 'htmlparser2';

var du = hp.DomUtils;

function getText(tags) {
	tags = du.filter(function(elem) {
		return (elem.type === 'text');
	}, tags.children || tags);
	tags = tags.reduce(function(p, c) {
		return p.concat( c.data );
	}, '');
	return tags;
}

export default getText;