import hp from 'htmlparser2';
import getRange from './getRange';
import getText from './getText';
import parseUrl from './parseUrl';
import rTrim from './rTrim';

var du = hp.DomUtils
	, exArt = 'View Artist'
	, exTorr = 'View Torrent';

function parseColInfo(td) {
	var span = du.filter(function(elem) {
				return (elem.name === 'span');
			}, td.children)[0]
		, div = du.filter(function(elem) {
				return (elem.name === 'div')
					&& (elem.attribs)
					&& (elem.attribs['class'] === 'tags');
			}, td.children)[0]
		, range = getRange(
			{ start: function(elem) {
					return elem === span;
				}
			, end: function(elem) {
					return elem === div;
				}
			, elems: td.children
			})
		, dl = parseUrl(du.findOne(function(elem) {
				return (elem.name === 'a');
			}, span.children))
		, info = du.findAll(function(elem) {
				return (elem.name === 'a');
			}, range)
		, art = parseUrl(info[0])
		, torr = parseUrl(info[1])
		, artOrig = rTrim(info[0].attribs.title, exArt)
		, torrOrig = rTrim(info[1].attribs.title, exTorr)
		, artName = getText(info[0])
		, torrName = getText(info[1]);
	return (
		{ id: torr.query.id
		, torrentid: torr.query.torrentid
		, artistid: art.query.id
		, artOrig: artOrig
		, artName: artName
		, torrOrig: torrOrig
		, torrName: torrName
		, authkey: dl.query.authkey[0]
		, torrent_pass: dl.query.torrent_pass[0]
		});
	
	return (
		//*
		range
		/*/
		{ span: span
		, range: range
		, div: div
		}); //*/);
}

export default parseColInfo;