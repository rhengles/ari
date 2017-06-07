/*eslint no-console:0*/

var fs = require('fs');
var path = require('path');
var express = require('express');
//var proxy = require('express-http-proxy');
var url = require('url');
var openDir = require('./utils/open-dir');
var port = 16385;
var dirname = process.argv[2];

function pathRel(p) {
	return path.join(__dirname, p);
}

if ( !dirname ) {
	console.error('Please specify a directory to save the files!');
	process.exit(1);
} else {
	dirname = path.resolve(dirname);
	openDir(dirname, function(err) {
		if (err) {
			console.error('Can\'t open directory specified!');
			console.error(err);
			return;
		}
		console.log('Using directory '+dirname);
		startServer();
	})
}

function startServer() {
	var app = express();

	app.use(handleRequest);

	app.listen(port, function() {
		console.log('Server running on port ' + port);
	});
}

function trimSlashes(str) {

}

function handleRequest(req, res) {
	var size = 0;
	console.log('init  ', req.method, req.originalUrl);

	req.on('data', function(chunk) {
		size += chunk.length;
		console.log('  data', req.method, req.originalUrl, chunk.length);
	});

	req.on('end', function() {
		console.log('  end ', req.method, req.originalUrl, size);
		res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
		res.write('Not found\n');
		res.write('Method '+req.method+'\n');
		res.write('Url '+req.originalUrl+'\n');
		res.write('Base '+req.baseUrl+'\n');
		res.write('Path '+req.path+'\n');
		//res.write('Query '+req.query+'\n');
		res.write('Body length '+size+'\n');
		res.end();
	});
}
