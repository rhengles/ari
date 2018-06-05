var path = require('path');
var buildReport = require('./includes/build-report');

var filePath = path.join(__dirname, '../build.json');

module.exports = buildReport.withPath(filePath);
