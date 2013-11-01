import fs from 'fs';

var rfo = { encoding: 'utf8' };
function loadJson(opt) {
	fs.readFile(opt.path, rfo, function(err, data) {
		if (err) {
			( opt.cbErr
			? opt.cbErr(err)
			: console.log('ERROR READING FILE '+opt.path+'\n'+err) );
			return;
		}
		opt.cb(JSON.parse(data));
	});
}

export default loadJson;