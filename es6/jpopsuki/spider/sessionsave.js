import Writer from '../writer';
import mkDir from '../mkdir';
import jsonPrint from './jsonprint';

function sessionSave(path, data, cb) {
	var name = data.user.name;
	mkDir(path, function() {
		var w = new Writer;
		w.onFinish = cb;
		w.setDir(path)
			.setName('session.json')
			.save(jsonPrint(data));
	});
}

export default sessionSave;