import fs from 'fs';

function sessionLoad(path, cb) {
	fs.readFile(path, {encoding: 'utf8'}, function(err, data) {
		if (err) {
			if ( err.code === 'ENOENT' ) {
				console.log('No session found');
			} else {
				console.log('Error loading '+path);
				console.log(err);
			}
			data = null;
		}
		if (data) {
			data = JSON.parse(data);
			if ( !data.user || !data.cookies ) {
				console.log('Invalid session file');
				console.log(data);
				data = null;
			}
		}
		cb(data);
	});
}

export default sessionLoad;