import hp from 'htmlparser2';
import getText from '../getText';
import parseSidebar from './parseArtistSidebar';
import parseMain from './parseArtistMain';

var du = hp.DomUtils;

function parseArtist(res, req, id) {
	var content;
	content = du.findOne(function(elem) {
		return (elem.name === 'div')
			&& (elem.attribs)
			&& (elem.attribs.id === 'content');
	}, res.dom);
	content = du.findOneChild(function(elem) {
		return (elem.name === 'div')
			&& (elem.attribs)
			&& (elem.attribs['class'] === 'thin');
	}, content.children);
	var info = parseInfo(content);
	var side = parseSidebar(content, info.name);
	var main = parseMain(content);
	info.description = main.description;
	return (
		{ info: info
		, side: side
		, torrents: main.torrents
		});
}

function parseInfo(content) {
	var name;
	var original;
	var h2 = du.find(function(elem) {
				return (elem.name === 'h2');
			}, content.children, false, 2);
	h2[0] && (name     = getText(h2[0]));
	h2[1] && (original = getText(h2[1]).replace(/^\(|\)$/gi, ''));
	return (
		{ name: name
		, original: original
		, description: void 0
		});
}

export default parseArtist;