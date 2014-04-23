import fs from 'fs';
import dirName from '../dirName';

function sessionLoad(name, cb) {
	var path = 'jpopsuki/user/'+dirName(name)+'/session.json';
	fs.readFile(path, {encoding: 'utf8'}, function(err, data) {
		if (err) {
			console.log('Error loading '+path);
			console.log(err);
		} else {
			data = JSON.parse(data);
			if ( data.user && data.cookies ) {
				cb(data);
			} else {
				console.log('Invalid session file');
				console.log(data);
			}
		}
	});
}

export default sessionLoad;