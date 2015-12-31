import hp from 'htmlparser2';
import getText from '../getText';
import parseTags from './parseTags';
import parseArtistLink from './parseArtistLink';

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
			, key: 'fans'
			, fn: parseSidebarFans }
		, { title: 'Similar artists'
			, key: 'similar'
			, fn: parseSidebarSimilar }
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

function getUlStats(elem) {
	return du.findOne(function(elem) {
		return (elem.name === 'ul')
			&& (elem.attribs)
			&& (/\bstats\b/.test(elem.attribs['class']));
	}, elem.children);
}

function parseSidebarTags(box) {
	return parseTags(getUlStats(box));
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
	list = getUlStats(box);
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

var reUser = /^[^?]*user\.php\?(?:[^#]*(?:=[^#]*)&(?:amp;)?)*id=([0-9]+)(?:[&#].*)?$/i;

var reArtistAction = /^[^?]*artist\.php\?(?:[^#]*(?:=[^#]*)&(?:amp;)?)*action=(fan)(?:[&#].*)?$/i;

var reArtistFan = /^[^?]*artist\.php\?(?:[^#]*(?:=[^#]*)&(?:amp;)?)*f=(add|remove)(?:[&#].*)?$/i;

function parseSidebarFans(box) {
	var ul = getUlStats(box);
	var fans = du.findAll(function(elem) {
				return (elem.name === 'a')
					&& (elem.attribs)
					&& reUser.test(elem.attribs.href || '');
			}, ul.children).map(function(a) {
				var m = a.attribs.href.match(reUser);
				return (
					{ id: m[1]
					, name: getText(a)
					});
			});
	var myself = du.findOne(function(elem) {
				return (elem.name === 'a')
					&& (elem.attribs)
					&& (reArtistAction.test(elem.attribs.href))
					&& (reArtistFan   .test(elem.attribs.href));
			}, box.children);
	myself = myself.attribs.href.match(reArtistFan);
	myself =
		( myself[1] === 'remove'
		? true
		: void 0 );
	return (
		{ users: fans
		, myself: myself
		});
}

function parseSidebarSimilar(box) {
	var ul = getUlStats(box);
	var li = du.filter(function(elem) {
				return (elem.name === 'li');
			}, ul.children, false);
	var similar = [];
	li.forEach(function(li) {
		li = parseArtistLink.findOne(li);
		if (li) {
			similar.push(
				{ id: parseArtistLink.getId(li)
				, name: getText(li)
				});
		}
	});
	return similar.length ? similar : void 0;
}

export default parseSidebar;