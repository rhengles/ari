import hp from 'htmlparser2';
import getText from '../getText';

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
	return (
		{ info: info
		, side: side
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
		});
}

function sidebarMapFind(name) {
	return (
		[ { title: name
			, key: 'image' }
		, { title: 'Tags'
			, key: 'tags' }
		, { title: 'Stats'
			, key: 'stats' }
		, { title: 'Fans'
			, key: 'fans' }
		, { title: 'Similar artists'
			, key: 'similar' }
		]);
}

function parseSidebar(content, name) {
	var sb = du.findOne(function(elem) {
				return (elem.name === 'div')
					&& (elem.attribs)
					&& (elem.attribs['class'] === 'sidebar');
			}, content.children);
	var boxes = du.findAll(function(elem) {
				return (elem.name === 'div')
					&& (elem.attribs)
					&& (elem.attribs['class'] === 'box');
			}, sb.children);
	boxes = parseSidebarBoxHead(boxes);
	var matches = parseSidebarMatches(boxes, sidebarMapFind(name));
	return matches;
}

function parseSidebarBoxHead(boxes) {
	var boxHead = [];
	//console.log('sidebar '+sb+' '+boxes);
	boxes.forEach(function(box) {
		var head = du.findOneChild(function(elem) {
					return (elem.name === 'div')
						&& (elem.attribs)
						&& (elem.attribs['class'] === 'head');
				}, box.children);
		if ( !head ) return;
		boxHead.push(
			{ head: getText(head)
			, box: box
			});
	});
	return boxHead;
}

function matchBoxTitle(title, search) {
	search = search.replace(/^\s+|\s+$/gi, '').toLowerCase();
	title  = title .replace(/^\s+|\s+$/gi, '').toLowerCase();
	return search === title;
}

function parseSidebarMatches(boxes, boxFind) {
	var matches = [];
	var matchMap = {};
	var result = {};
	var bcount = boxes.length;
	for ( var i = 0; i < bcount; i++ ) {
		var box = boxes[i];
		var fcount = boxFind.length;
		for ( var j = 0; j < fcount; j++ ) {
			var find = boxFind[j];
			if ( matchBoxTitle(box.head, find.title) ) {
				var match = matchMap[find.key];
				if ( !match ) {
					matchMap[find.key] = match = [];
					matches.push(
						{ find: find
						, box: match
						});
				}
				match.push(box);
				boxes.splice(i, 1);
				i--;
				bcount--;
			}
		}
	}
	bcount = matches.length;
	for ( var i = 0; i < bcount; i++ ) {
		var match = matches[i];
		if ( 1 === match.box.length ) {
			match.box = match.box[0];
			result[match.find.key] = {};
		} else {
			console.log('sidebar match '+match.find.key+' '+match.box.length);
			matches.splice(i, 1);
			i--;
			bcount--;
		}
	}
	return bcount ? result : void 0;
}

export default parseArtist;