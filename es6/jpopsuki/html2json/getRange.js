import hp from 'htmlparser2';

var du = hp.DomUtils;

function getRange(opt) {
	var start = []
		, end = []
		, elems = opt.elems;
	if ( !opt.start && !opt.end ) return opt.elems;
	for ( var i = 0, ii = elems.length; i < ii; i++ ) {
		if ( opt.start(elems[i]) ) start.push(
			{ index: i
			, elem: elems[i]
			});
		if ( opt.end(elems[i]) ) end.push(
			{ index: i
			, elem: elems[i]
			});
	}
	if ( start.length > 1 ) {
		start = ( opt.startDecide
			? opt.startDecide(start)
			: decideFirst(start) );
	} else if ( start.length ) {
		start = start[0];
	}
	if ( end.length > 1 ) {
		end = ( opt.endDecide
			? opt.endDecide(start)
			: decideLast(start) );
	} else if ( end.length ) {
		end = end[0];
	}
	var si = +!opt.startInclusive
		, ei = +!!opt.endInclusive;
	start = ( start
		? start.index + si
		: 0 );
	end = ( end
		? end.index - start + si + ei + 1
		: (elems.length - start) );
	return elems.slice(start, end);
}

function decideFirst(list) {
	return list[0];
}
function decideLast(list) {
	return list[list.length-1];
}

getRange.decideFirst = decideFirst;
getRange.decideLast = decideLast;

export default getRange;