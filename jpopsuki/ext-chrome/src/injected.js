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

var req = new XMLHttpRequest();

req.addEventListener('load', function(evt) {
	console.log(evt);
}, false);
req.addEventListener('error', function(evt) {
	console.error(evt);
}, false);

req.open('post', '//127.0.0.1:1337/1');
req.setRequestHeader('Content-Type', 'text/html; charset=UTF-8');

req.send(
	docType() +
	document.documentElement.outerHTML
);

