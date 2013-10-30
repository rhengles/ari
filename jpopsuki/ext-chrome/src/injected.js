//alert('injected');

function docType() {
	var node = document.doctype;
	return ( node
		? '<!DOCTYPE '
			+ node.name
			+ (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
			+ (!node.publicId && node.systemId ? ' SYSTEM' : '') 
			+ (node.systemId ? ' "' + node.systemId + '"' : '')
			+ '>\n'
		: '' );
}

<<<<<<< HEAD
function next() {
	var last = lastPage()
		, current = parseInt( page[1], 10 );
	(current > last) && (last = current);
	console.log('Done page '+current+' of '+last);
	if ( current == last ) {
		console.log('Finished!');
	} else {
		location.href = location.href.replace(rePage, 'page='+(1+current));
	}
}

function pageOf(a) {
	return parseInt( a.href.match(rePage)[1], 10 );
}
function lastPage() {
	return Array.prototype.slice.call(document
			.querySelectorAll('a[href^="torrents.php?page="]'))
		.reduce(function(p, c) {
			return Math.max( p, pageOf(c) );
		}, 0);
}

var rePage = /\bpage=(\d+)\b/
	, page = location.search.match(rePage)
	, req = new XMLHttpRequest();

if ( !(page && page[1]) ) {
	throw new Error('Página não reconhecida!');
}

req.addEventListener('load', function(evt) {
	console.log(evt);
	next();
=======
var req = new XMLHttpRequest();

req.addEventListener('load', function(evt) {
	console.log(evt);
>>>>>>> Jpopsuki spider
}, false);
req.addEventListener('error', function(evt) {
	console.error(evt);
}, false);

<<<<<<< HEAD
req.open('post', '//127.0.0.1:1337/'+page[1]);
=======
req.open('post', '//127.0.0.1:1337/1');
>>>>>>> Jpopsuki spider
req.setRequestHeader('Content-Type', 'text/html; charset=UTF-8');

req.send(
	docType() +
	document.documentElement.outerHTML
);

