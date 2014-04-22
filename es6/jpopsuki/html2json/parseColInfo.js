import hp from 'htmlparser2';
import ent from 'entities';
import getRange from './getRange';
import getText from '../getText';
import parseUrl from './parseUrl';
import rTrim from './rTrim';
import dirName from '../dirName';

var du = hp.DomUtils
	, exArt = 'View Artist'
	, exTorr = 'View Torrent'
	, exCom  = 'View Comments'
	, reInfo = /\[([^\]]*)\]\s*\[([\.\d]*)\]/;

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
		, sl = du.findAll(function(elem) {
				return (elem.name === 'a');
			}, span.children)
		, info = function(info) {
				var a = [], t;
				for ( var i = 0, ii = info.length; i < ii; i++ ) {
					t = info[i].attribs.title;
					t &&
					( t.indexOf(exArt ) != -1 ? (a[0] = info[i]) :
					( t.indexOf(exTorr) != -1 ? (a[1] = info[i]) :
					( t.indexOf(exCom ) != -1 ? (a[2] = info[i]) : null )));
				}
				return a;
			}(du.findAll(function(elem) {
				return (elem.name === 'a');
			}, range))
		, det = getText(range).match(reInfo)
		, art = info[0] ? parseUrl(info[0]) : null
		, torr = parseUrl(info[1])
		, artOrig = info[0] ? rTrim(info[0].attribs.title, exArt) : null
		, torrOrig = rTrim(info[1].attribs.title, exTorr)
		, artName = info[0] ? ent.decode(getText(info[0])) : null
		, torrName = ent.decode(getText(info[1]))
    , artDir = artName ? dirName(artName) : null
    , torrDir = dirName(torrName)
		, comments = info[2] && getText(info[2])
		, tags = du.findAll(function(elem) {
				return (elem.name === 'a');
			}, div.children).map(function(a) {
				return getText(a);
			});
	return (
		{ id: torr.query.id
		, artist: art
			? { id: art.query.id
				, original: artOrig
				, name: artName
				, dirName: artDir === artName ? void 0 : artDir
				}
			: null
		, torrent:
			{ id: torr.query.torrentid
			, original: torrOrig
			, name: torrName
      , dirName: torrDir === torrName ? void 0 : torrDir
			//, authkey: dl.query.authkey[0]
			//, torrent_pass: dl.query.torrent_pass[0]
			}
		, format: det && det[1]
		, date: det && det[2]
		, comments: comments
		, tags: tags
    , reported: (sl && sl[1] && getText(sl[1]) === 'Reported!')
      ? true
      : void 0
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