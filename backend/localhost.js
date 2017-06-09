/*eslint no-console:0*/

var fs = require('fs');
var path = require('path');
var express = require('express');
//var proxy = require('express-http-proxy');
var url = require('url');

var app = express();

var port = process.argv[2];

app.use(express.static(process.argv[3]));

app.listen(port, function() {
	console.log('Server running on port ' + port);
});
