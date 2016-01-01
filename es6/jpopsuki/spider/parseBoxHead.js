import hp from 'htmlparser2';
import getText from '../getText';

var du = hp.DomUtils;

function parseBoxHead(boxes) {
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

function findBoxes(elem) {
	return du.findAll(function(elem) {
		return (elem.name === 'div')
			&& (elem.attribs)
			&& (elem.attribs['class'] === 'box');
	}, elem.children);
}

function parseMatches(boxes, boxFind) {
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

function matchBoxTitle(title, search) {
	search = search.replace(/^\s+|\s+$/gi, '').toLowerCase();
	title  = title .replace(/^\s+|\s+$/gi, '').toLowerCase();
	return search === title;
}

parseBoxHead.find = findBoxes;
parseBoxHead.matches = parseMatches;
parseBoxHead.matchTitle = matchBoxTitle;

export default parseBoxHead;