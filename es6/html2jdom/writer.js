import fs from 'fs';

function writer(name, data) {
	fs.writeFile(name, data, function(err) {
		if (err) {
			console.log('ERROR WRITING FILE '+name);
			console.log(err);
			return;
		}
		//console.log('FILE SAVED '+name);
	});
}

export default writer;