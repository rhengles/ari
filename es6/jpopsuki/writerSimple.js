import Writer from './writer';

function writerSimple(name, data, cb) {
	var w = new Writer;
	if ( typeof name === 'string' ) {
		w.setName(name);
	} else {
		w.setDir(name.dir);
		w.setName(name.name);
	}
	cb && (w.onFinish = cb);
	w.save(data);
}

export default writerSimple;