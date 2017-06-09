/*eslint no-console:0*/

var fs = require('fs');
var path = require('path');
var base64Stream = require('base64-stream');
var express = require('express');
//var proxy = require('express-http-proxy');
var url = require('url');
var openDir = require('./utils/open-dir');
var port = 16385;
var baseDir = process.argv[2];
var openFilesMap = {};

function pathRel(p) {
	return path.join(__dirname, p);
}

if ( !baseDir ) {
	console.error('Please specify a directory to save the files!');
	process.exit(1);
} else {
	baseDir = path.resolve(baseDir);
	openDir(baseDir, function(err) {
		if (err) {
			console.error('Can\'t open directory specified!');
			console.error(err);
			return;
		}
		console.log('Using directory '+baseDir);
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
	return str.replace(/^\/+|\/+$/g,'');
}

function getDirArray(filedir) {
	return trimSlashes(filedir).split(/\/+/g);
}

function handleRequest(req, res) {
	//console.log('init  ', req.method, req.originalUrl);

	if (req.method === 'GET') {
		console.log('.', req.method, req.originalUrl);
		res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' });
		res.write('OK\n');
		res.end();
	} else if (req.method === 'POST') {
		var filepath = req.path;
		if ( openFilesMap[filepath] ) {
			res.writeHead(400, { 'Content-Type': 'text/plain; charset=UTF-8' });
			res.write('Cannot save '+req.path+'\n');
			res.write('Path is already open\n');
			res.end();
			return;
		}
		openFilesMap[filepath] = true;
		var size = 0;
		var filedir = path.dirname(req.path);
		openDir.array(baseDir, getDirArray(filedir), function(err) {
			if (err) {
				res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
				res.write('Error creating directory '+filedir+'\n');
				res.write(err+'\n');
				res.end();
				openFilesMap[filepath] = void 0;
				return;
			}
			var ws = fs.createWriteStream(path.join(baseDir, req.path));
			var encoding = req.headers['x-chrome-encoding'];
			var decoder;
			if ( encoding === 'base64' ) {
				decoder = base64Stream.decode();
				decoder.on('data', function(chunk) {
					size += chunk.length;
					ws.write(chunk);
				});
				decoder.on('end', function() {
					ws.end();
				});
			} else if ( encoding ) {
				res.writeHead(400, { 'Content-Type': 'text/plain; charset=UTF-8' });
				res.write('Cannot save '+req.path+'\n');
				res.write('Unknown encoding '+encoding+'\n');
				res.end();
				openFilesMap[filepath] = void 0;
				return;
			}
			openFilesMap[filepath] = ws;
			req.on('data', function(chunk) {
				if (decoder) {
					decoder.write(chunk);
				} else {
					size += chunk.length;
					ws.write(chunk);
				}
			});
			req.on('end', function() {
				if (decoder) {
					decoder.end();
				} else {
					ws.end();
				}
			});
			/*req.on('end', function() {
				console.log('.', req.method, size, req.originalUrl);
				res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
				res.write('Not found\n');
				res.write('Method '+req.method+'\n');
				res.write('Url '+req.originalUrl+'\n');
				res.write('Base '+req.baseUrl+'\n');
				res.write('Path '+req.path+'\n');
				//res.write('Query '+req.query+'\n');
				res.write('Body length '+size+'\n');
				res.end();
			});*/
			ws.on('error', function(err) {
				console.log('X error', req.method, size, req.originalUrl);
				console.error(err);
				res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
				res.write('Error saving file '+req.path+'\n');
				res.write(err+'\n');
				res.end();
				openFilesMap[filepath] = void 0;
			});
			ws.on('finish', function() {
				console.log('.', req.method, size, req.originalUrl);
				res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' });
				res.write('File saved successfully!\n');
				res.write('Path '+req.path+'\n');
				//res.write('Query '+req.query+'\n');
				res.write('File size '+size+'\n');
				if (encoding) {
					res.write('Encoding '+encoding+'\n');
				} else {
					res.write('Raw input\n')
				}
				res.end();
				openFilesMap[filepath] = void 0;
			});
		});
	}
}
