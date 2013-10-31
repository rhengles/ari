import hp from 'htmlparser2';

var du = hp.DomUtils;

function parseColCover(td) {
	var a = du.findOne(function(elem) {
				return (elem.name === 'a');
			}, td.children)
		, img = du.findOne(function(elem) {
				return (elem.name === 'img');
			}, a.children);
	return (
		{ full: a.attribs.href
		, thumb: img.attribs.src
		});
}

export default parseColCover;