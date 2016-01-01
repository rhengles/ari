import hp from 'htmlparser2';

var du = hp.DomUtils;

function getText(tags) {
	tags = du.filter(function(elem) {
		return (elem.type === hp.ElementType.Text);
	}, tags.children || tags);
	tags = tags.reduce(function(p, c) {
		return p.concat( c.data );
	}, '');
	return tags;
}

function makeText(str) {
	return (
		{ type: hp.ElementType.Text
		, data: str
		});
}

getText.make = makeText;

export default getText;