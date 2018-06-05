var fs = require('fs');

module.exports = function(opt) {
	var rs = fs.createReadStream(opt.input);
	var ws = fs.createWriteStream(opt.output);
	ws.on('close', opt.callback);
	ws.on('error', opt.callback);
	rs.on('end', function() {
		ws.write(opt.after || '');
		ws.end();
	});
	ws.write(opt.before || '');
	rs.pipe(ws, { end: false });
};
