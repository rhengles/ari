var lodash = require('lodash-cli');
var node_path = require('path');

function pathRel(p) {
	return node_path.join(__dirname, p);
}

function lodashCallback(data) {
	console.log('/src/js/lodash created');
	//console.log(data);
}

lodash(
	[
		'modularize',
		'exports=es',
		'--development',
		'--output',
		pathRel('../src/js/lodash')
	],
	lodashCallback
);
