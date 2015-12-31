import hp from 'htmlparser2';
import getRows from '../html2json/getRows';
import parsePages from './parsePages';
import parseTags from './parseTags';
import getText from '../getText';

var du = hp.DomUtils;

function parseArtists(res, req, page) {
	return (
		{ lastPage: parsePages(res.dom)
		, rows: parsePage(res.dom, page)
		});
}

function parseRowPage(page) {
	return function (val, key) {
		return parseRow(val, key, page);
	};
}

function parsePage(dom, page) {
	var rows = getRows(dom);
	console.log('PAGE '+page+': '+rows.length+' ROWS FOUND');
	return rows.map(parseRowPage(page));
}

function parseRow(row, index, page) {
	var tds = du.findAll(function(elem) {
				return (elem.name === 'td');
			}, row.children)
		, info = colInfo(tds[1]);
	info.original = getText(tds[2]);
	return (
		{ cover: colCover(tds[0])
		, info: info
		, fans: getText(tds[3])
		, torrents: getText(tds[4])
		, requests: getText(tds[5])
		, snatches: getText(tds[6])
		});
}

function colCover(td) {
	var img = du.findOne(function(elem) {
				return (elem.name === 'img')
					&& elem.attribs
					&& elem.attribs.src;
			}, td.children);
	if ( img ) {
		return { thumb: img.attribs.src };
	}
}

var reArtist = /^[^?]*artist\.php\?(?:[^#]*(?:=[^#]*)&)*id=([0-9]+)(?:[&#].*)?$/i;

function colInfo(td) {
	var artist = du.findOne(function(elem) {
				return (elem.name === 'a')
					&& (elem.attribs)
					&& reArtist.test(elem.attribs.href || '');
			}, td.children);
	var tags = du.findOne(function(elem) {
				return (elem.name === 'div')
					&& (elem.attribs)
					&& (elem.attribs['class'] === 'tags');
			}, td.children);
	tags =
		( tags
		? parseTags(tags)
		: void 0 );
	var about = du.findAll(function(elem) {
				return (elem.name === 'div');
			}, td.children).pop();
	about = getText(about);
	return (
		{ id: artist.attribs.href.match(reArtist)[1]
		, name: getText(artist)
		, tags: tags
		, about: about
		, original: void 0
		});
}

export default parseArtists;