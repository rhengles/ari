var fs = require('fs');
var fileOpt = {encoding: 'utf8'};

function load(path, cb) {
	fs.readFile(path, fileOpt, (err, data) => {
		if (err) return cb(err, data);
		try {
			data = JSON.parse(data);
		} catch (e) {
			return cb(e, data);
		}
		return cb(err, data);
	});
}

function save(path, data, cb) {
	try {
		data = JSON.stringify(data);//, null, '\t');
	} catch (e) {
		return cb(e);
	}
	fs.writeFile(path, data, fileOpt, cb);
}

function withPath(path) {
	return {
		load: function(cb) {
			return load(path, cb);
		},
		save: function(data, cb) {
			return save(path, data, cb);
		}
	};
}

module.exports = {
	load: load,
	save: save,
	withPath: withPath
};
