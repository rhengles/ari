import hp from 'htmlparser2';
import getText from '../getText';
import parseTags from './parseTags';

var du = hp.DomUtils;

function sidebarMapFind(name) {
	return (
		[ { title: name
			, key: 'image'
			, fn: parseSidebarImage }
		, { title: 'Tags'
			, key: 'tags'
			, fn: parseSidebarTags }
		, { title: 'Stats'
			, key: 'stats'
			, fn: parseSidebarStats }
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
				match.push(box.box);
				boxes.splice(i, 1);
				i--;
				bcount--;
			}
		}
	}
	bcount = matches.length;
	for ( var i = 0; i < bcount; i++ ) {
		var match = matches[i];
		var find = match.find;
		if ( 1 === match.box.length ) {
			match.box = match.box[0];
			result[find.key] =
				( find.fn
				? find.fn(match.box)
				: void 0
				);
		} else {
			console.log('sidebar match '+find.key+' '+match.box.length);
			matches.splice(i, 1);
			i--;
			bcount--;
		}
	}
	return bcount ? result : void 0;
}

function parseSidebarImage(box) {
	var a = du.findOne(function(elem) {
				return (elem.name === 'a')
					&& (elem.attribs)
					&& (elem.attribs.href);
			}, box.children);
	var img = du.findOne(function(elem) {
				return (elem.name === 'img')
					&& (elem.attribs)
					&& (elem.attribs.src);
			}, a.children);
	if ( img ) {
		return (
			{ full: a.attribs.href
			, thumb: img.attribs.src
			});
	}
}

function parseSidebarTags(box) {
	return parseTags(box);
}

function prepareStatRegex(item) {
	var re = new RegExp(item+'\\s*:\\s*(\\d*)', 'i');
	return (
		{ name: item
		, re: re
		});
}

var statList =
		[ 'albums'
		, 'torrents'
		, 'snatches'
		].map(prepareStatRegex);

function parseSidebarStats(box) {
	var result = {};
	var list;
	var scount = 0;
	list = du.findOne(function(elem) {
		return (elem.name === 'ul')
			&& (elem.attribs)
			&& (-1 != elem.attribs.class.indexOf('stats'));
	}, box.children);
	list = du.findAll(function(elem) {
		return (elem.name === 'li');
	}, list.children);
	list.forEach(function(li) {
		li = getText(li);
		//console.log('stat '+li);
		statList.forEach(function(stat) {
			var m = li.match(stat.re);
			if (m) {
				if ( null == result[stat.name] ) {
					//console.log('stat '+stat.re+' ['+li+'] '+m);
					result[stat.name] = parseInt(m[1], 10) || 0;
					scount++;
				} else {
					//console.log('stat duplicated '+stat.name+' '+result[stat.name]+':'+m[1]);
				}
			}
		});
	});
	return scount ? result : void 0;
}

export default parseSidebar;