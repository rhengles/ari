/*eslint no-console:0*/

var fs = require('fs');
var path = require('path');
var express = require('express');
var httpProxy = require('express-http-proxy');
var url = require('url');

var app = express();

var port = process.argv[2];

var proxyServer = httpProxy(process.argv[3]/*, {
	proxyReqPathResolver: function(req, res) {
		return url.parse(req.originalUrl).path;
	}
}*/);

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	next();
});

app.use(proxyServer);

app.listen(port, function() {
	console.log('Server running on port ' + port);
});
