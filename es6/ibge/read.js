import fs from 'fs';

function read(opt) {
	function onErr(err) {
		( opt.cbErr
		? opt.cbErr(err)
		: console.log('ERRO: '+err)
		);
	}

	var rs = fs.createReadStream(opt.path)
		, data = '';
	rs.on('error', onErr);
	rs.on('data', function(chunk) {
		data += chunk;
	});
	rs.on('end', function() {
		opt.cb(data);
	});

}

export default read;