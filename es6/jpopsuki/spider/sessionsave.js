import Writer from '../writer';
import mkDir from '../mkdir';
import dirName from '../dirName';
import jsonPrint from './jsonprint';

function sessionSave(data, cb) {
	var name = data.user.name
		, path = 'jpopsuki/user/'+dirName(name);
	mkDir(path, function() {
		var w = new Writer;
		w.onFinish = cb;
		w.setDir(path+'/')
			.setName('session.json')
			.save(jsonPrint(data));
	});
}

export default sessionSave;