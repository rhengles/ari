import fs from 'fs';

function statError(path, err) {
	console.log('Error loading '+path);
	console.log(err);
}

function mkDirErr(path, cb) {
	fs.stat(path, function(err, stat) {
		if (err) {
			if (err.code === 'ENOENT') {
				fs.mkdir(path, function(err) {
					if (err) {
						cb(err);
					} else {
						cb();
					}
				});
			} else {
				cb(err);
			}
		} else if ( stat.isDirectory() ) {
			cb();
		} else {
			cb(new Error('Path exists but is not a directory: '+path), stat);
		}
	});
}

function mkDir(path, cb) {
	mkDirErr(path, function(err, stat) {
		if (err) {
			if (stat) {
				console.log(stat);
			} else {
				console.log('Error loading '+path);
			}
			console.log(err);
		} else {
			cb();
		}
	});
}

function mkDirRec(path, cb) {
	function next() {
		if ( !path.length ) {
			return cb();
		}
		var dir = path.shift();
		var current = created.concat(dir).join('/');
		mkDirErr(current, function(err, stat) {
			if (err) {
				return cb(err, stat);
			}
			created.push(dir);
			next();
		});
	}
	path = [].concat(path);
	var created = [];
	next();
}

mkDir.err = mkDirErr;
mkDir.rec = mkDirRec;

export default mkDir;