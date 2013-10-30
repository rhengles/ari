import fs from 'fs';

function Writer() {
}

Writer.prototype.saveDir = 'jpopsuki/data/';

Writer.prototype.getWriteStream = function() {
	//fs.open(this.name, 'w', this.onFileOpen.bind(this));
	if ( !this.ws ) {
		var path = this.saveDir+this.name;
		this.ws = fs.createWriteStream(path);
		fs.realpath(path, this.onPath.bind(this));
		this.ws.on('error', this.onError.bind(this));
		this.ws.on('finish', this.onFinish.bind(this));
	}
	return this.ws;
}

Writer.prototype.normalizeFileName = function(file, ext) {
	return file
		.replace(/\W/g, '')
		.substr(0, 64)
		.concat(ext ? '.'+ext.substr(0, 8) : '');
}

Writer.prototype.saveAs = function(req, file, ext) {
	(ext == null) || (file = this.normalizeFileName(file, ext));
	this.name = file;
	return this.saveReq(req);
}

Writer.prototype.getNameFromReq = function(req, ext) {
	return this.normalizeFileName(req.url, ext);
}

Writer.prototype.saveReq = function(req) {
	req.pipe( this.getWriteStream() );
	return this;
}

Writer.prototype.save = function(req, ext) {
	this.name || (this.name = this.getNameFromReq(req, ext));
	return this.saveReq(req);
}

Writer.prototype.onError = function(err) {
	console.log('ERROR WRITING FILE "'+this.name+'":');
	console.log(err);
}

Writer.prototype.onFinish = function() {
	console.log('FILE "'+this.name+'" SAVED');
}

Writer.prototype.onPath = function(err, path) {
	if (err) return this.onError(err);
	console.log('REAL: '+path);
}

export default Writer;