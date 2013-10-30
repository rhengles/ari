import fs from 'fs';

function Writer() {
}

Writer.prototype.getWriteStream = function() {
	//fs.open(this.name, 'w', this.onFileOpen.bind(this));
	if ( !this.ws ) {
		this.ws = fs.createWriteStream(this.name);
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
	return this.save(req);
}

Writer.prototype.getNameFromReq = function(req) {
}

Writer.prototype.save = function(req) {
	req.pipe( this.getWriteStream() );
	return this;
}

Writer.prototype.onError = function(err) {
	console.log('ERROR WRITING FILE "'+this.name+'":');
	console.log(err);
}

Writer.prototype.onFinish = function() {
	console.log('FILE "'+this.name+'" SAVED');
}

export default Writer;