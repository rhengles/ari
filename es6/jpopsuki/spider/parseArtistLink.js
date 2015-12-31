import hp from 'htmlparser2';

var du = hp.DomUtils;

var reArtist = /^[^?]*artist\.php\?(?:[^#]*(?:=[^#]*)&)*id=([0-9]+)(?:[&#].*)?$/i;

function testArtist(elem) {
	return (elem.name === 'a')
		&& (elem.attribs)
		&& reArtist.test(elem.attribs.href || '');
}

function findOne(elem) {
	return du.findOne(testArtist, elem.children);
}

function findAll(elem) {
	return du.findAll(testArtist, elem.children);
}

function getId(elem) {
	return elem.attribs.href.match(reArtist)[1];
}

var parseArtistLink =
		{ test: testArtist
		, findOne: findOne
		, findAll: findAll
		, getId: getId
		};

export default parseArtistLink;