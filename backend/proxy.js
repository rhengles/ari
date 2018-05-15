/*eslint no-console:0*/

var fs = require('fs');
var path = require('path');
var express = require('express');
var httpProxy = require('express-http-proxy');
var url = require('url');

var proxyConfig = {};

if (process.argv[4]) {
	proxyConfig.limit = process.argv[4];
}

var app = express();

var port = process.argv[2];

var proxyServer = httpProxy(process.argv[3], proxyConfig);

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
	res.setHeader('Access-Control-Max-Age', '86400');
	if (req.method.toUpperCase() === 'OPTIONS') {
		return res.status(200).end();
	}
	next();
});

app.use(proxyServer);

app.listen(port, function() {
	console.log('Server running on port ' + port);
});
