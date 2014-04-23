import fs from 'fs';

function statError(path, err) {
	console.log('Error loading '+path);
	console.log(err);
}

function mkDir(path, cb) {
	fs.stat(path, function(err, stat) {
		if (err) {
			if (err.code === 'ENOENT') {
				fs.mkdir(path, function(err) {
					if (err) {
						statError(path, err);
					} else {
						cb();
					}
				});
			} else {
				statError(path, err);
			}
		} else if ( stat.isDirectory() ) {
			cb();
		} else {
			console.log('Path exists but is not a directory: '+path);
			console.log(stat);
		}
	});
}

export default mkDir;