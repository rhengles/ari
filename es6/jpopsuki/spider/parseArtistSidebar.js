import hp from 'htmlparser2';
import getText from '../getText';
import parseBoxHead from './parseBoxHead';
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
	var boxes = parseBoxHead.find(sb);
	boxes = parseBoxHead(boxes);
	var matches = parseBoxHead.matches(boxes, sidebarMapFind(name));
	return matches;
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