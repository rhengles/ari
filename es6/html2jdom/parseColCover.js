import hp from 'htmlparser2';

var du = hp.DomUtils;

function parseColCover(td, info, index, page) {
	var a = du.findOne(function(elem) {
				return (elem.name === 'a');
			}, td.children)
		, img = du.findOne(function(elem) {
				return (elem.name === 'img');
			}, td.children);
	if ( !(a || img) ) {
		console.log('NO COVER '+page+
			'/'+index+
			': ['+info.date+
			'] '+info.artist.name+
			' - '+info.torrent.name);
	}
	return ( a || img )
		? { full: a ? a.attribs.href : void 0
			, thumb: img ? img.attribs.src : void 0
			}
		: void 0;
}

export default parseColCover;