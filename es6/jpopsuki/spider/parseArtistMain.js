import hp from 'htmlparser2';
import getText from '../getText';
import parseBoxHead from './parseBoxHead';
import parseTags from './parseTags';

var du = hp.DomUtils;

function parseMain(content) {
	var column = du.findOne(function(elem) {
				return (elem.name === 'div')
					&& (elem.attribs)
					&& (elem.attribs['class'] === 'main_column');
			}, content.children);
	var boxes = parseBoxHead.find(column);
	boxes = parseBoxHead(boxes);
	var result = parseBoxHead.matches(boxes, mainMapFind()).info;
	result.torrents = parseMainTorrents(column);
	return result;
}

function mainMapFind() {
	return (
		[ { title: 'Artist Info'
			, key: 'info'
			, fn: parseMainInfo }
		]);
}

function parseMainInfo(box) {
	box = du.findOne(function(elem) {
		return (elem.name === 'div')
			&& (elem.attribs)
			&& (elem.attribs['class'] === 'body');
	}, box.children);
	replaceLinks(box);
	return (
		{ description: getText(box)
		});
}

function replaceLinks(elem) {
	du.findAll(function(elem) {
		return (elem.name === 'a')
			&& (elem.attribs)
			&& (elem.attribs.href);
	}, elem.children).forEach(function(a) {
		du.replaceElement(a, getText.make(
			'['+getText(a)+']('+a.attribs.href+')'
		));
	});
}

function parseMainTorrents(main) {
	var torrents = [];
	du.findAll(function(elem) {
		return (elem.name === 'table')
			&& (elem.attribs)
			&& (elem.attribs.id)
			&& (elem.attribs['class'] === 'torrent_table');
	}, main.children).forEach(function(table) {
		var key = table.attribs.id.replace(/^torrents_/i, '');
		torrents.push( parseMainTorrentsKey(table, key) );
	});
	return torrents;
}

function parseMainTorrentsKey(table, key) {
	var tr = du.filter(function(elem) {
				return (elem.name === 'tr');
			}, table.children, false);
	var currentGroup;
	var title;
	var groups = [];
	tr.forEach(function(tr) {
		if ( testTorrentHead(tr) ) {
			title = parseTorrentHead(tr);
		} else if ( testTorrentGroup(tr, key) ) {
			currentGroup = parseTorrentGroup(tr, key);
			groups.push(currentGroup);
		} else if ( testTorrentFormat(tr, key) ) {
			currentGroup.formats.push( parseTorrentFormat(tr, key) );
		}
	});
	return (
		{ key: key
		, title: title
		, groups: groups
		});
}

function testTorrentHead(tr) {
	return (tr.attribs)
		&& (tr.attribs['class'] === 'colhead_dark');
}

function parseTorrentHead(tr) {
	var td = du.findAll(function(elem) {
				return (elem.name === 'td');
			}, tr.children);
	var title = du.findOne(function(elem) {
				return (elem.name === 'strong');
			}, td[1].children);
	return getText(title);
}

function testTorrentGroup(tr, key) {
	return (tr.attribs)
		&& (/(?:\s|^)group(?:$|\s)/i.test(tr.attribs['class']));
}

function findImg(elem) {
	return du.findOne(function(elem) {
		return (elem.name === 'img');
	}, elem.children);
}

function parseTorrentGroupImg(tr) {
	var imgLink = du.findOne(function(elem) {
				if (elem.name === 'a') {
					return !!findImg(elem);
				}
				return false;
			}, tr.children);
	if ( !imgLink ) return;
	var image = findImg(imgLink);
	return (
		{ full: imgLink.attribs.href
		, thumb: image.attribs.src
		});
}

var reDate = /(?:\s|^)(\d+\.\d+\.\d+)(?:$|\s)/i;

var reTorrent = /^[^?]*torrents\.php\?(?:[^#]*(?:=[^#]*)&(?:amp;)?)*id=([0-9]+)(?:[&#].*)?$/i;
var reTorrentFormat = /^[^?]*torrents\.php\?(?:[^#]*(?:=[^#]*)&(?:amp;)?)*torrentid=([0-9]+)(?:[&#].*)?$/i;

var reTitleComments = /^\s*View Comments\s*$/i;

function parseTorrentGroupInfo(tr) {
	var strong = du.findOne(function(elem) {
				return (elem.name === 'strong');
			}, tr.children);
	var date;
	du.filter(function(elem) {
		//console.log('torrent info ['+
		//	JSON.stringify(hp.ElementType.Text)+' = '+
		//	JSON.stringify(elem.type)+']');
		if (elem.type === hp.ElementType.Text) {
			//console.log('torrent info - '+JSON.stringify(elem.data));
			var m = elem.data.match(reDate);
			if ( !m ) return false;
			date = m[1];
			return true;
		}
		return false;
	}, strong.children, false, 1);
	var links = du.findAll(function(elem) {
				return (elem.name === 'a')
					&& (elem.attribs)
					&& (elem.attribs.href);
			}, strong.children);
	var id = links[0].attribs.href.match(reTorrent)[1];
	var name = getText(links[0]);
	var comments = links[1];
	if ( comments ) {
		if ( comments.attribs && reTitleComments.test(comments.attribs.title || '') ) {
			comments = getText(comments);
		} else {
			comments = void 0;
		}
	}
	var tags = du.findOne(function(elem) {
				return (elem.name === 'div')
					&& (elem.attribs)
					&& (elem.attribs['class'] === 'tags');
			}, tr.children);
	tags && (tags = parseTags(tags));
	return (
		{ date: date
		, id: id
		, name: name
		, comments: comments
		, tags: tags
		});
}

function parseTorrentGroup(tr, key) {
	var image = parseTorrentGroupImg(tr);
	var info  = parseTorrentGroupInfo(tr);
	return (
		{ image: image
		, info: info
		, formats: []
		});
}

function testTorrentFormat(tr, key) {
	return (tr.attribs)
		&& (/(?:\s|^)group_torrent(?:$|\s)/i.test(tr.attribs['class']));
}

function parseTorrentFormat(tr, key) {
	var id;
	var format;
	var snatched;
	var tds = du.findAll(function(elem) {
				return (elem.name === 'td');
			}, tr.children);
	du.findOne(function(elem) {
		if ( elem.name === 'a' && elem.attribs ) {
			var m = elem.attribs.href.match(reTorrentFormat);
			if ( m ) {
				id = m[1];
				format = getText(elem).split('/').map(function(f) {
					return f.replace(/^\s+|\s+$/g, '');
				});
				return true;
			}
		}
		return false;
	}, tds[1].children);
	du.findOne(function(elem) {
		if ( elem.name === 'strong' ) {
			if ( /^\s*snatched\s*$/i.test(getText(elem)) ) {
				snatched = true;
				return true;
			}
		}
		return false;
	}, tds[1].children);
	var size = getText(tds[2]);
	var snatches = getText(tds[3]);
	var seeders = getText(tds[4]);
	var leechers = getText(tds[5]);
	return (
		{ id: id
		, format: format
		, size: size
		, snatches: snatches
		, seeders: seeders
		, leechers: leechers
		, snatched: snatched
		});
}

export default parseMain;