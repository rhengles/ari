import fs from 'fs';

function Writer() {
}

Writer.prototype.dir = '';

Writer.prototype.setDir = function(dir) {
	this.dir = dir;
	return this;
};

Writer.prototype.getWriteStream = function() {
	var error  = this.onError
		, finish = this.onFinish;
	if ( !this.ws ) {
		this.path = this.dir+this.name;
		this.ws = fs.createWriteStream(this.path);
		//fs.realpath(path, this.onPath.bind(this));
		error  && this.ws.on('error' , error .bind(this));
		finish && this.ws.on('finish', finish.bind(this));
	}
	return this.ws;
};

Writer.prototype.reInvalid = /[^\w .-]/g;
Writer.prototype.reEndPeriod = /\.+$/; // Names ending with a period causes errors on Windows

Writer.prototype.prepareName = function(name, ext) {
	var ri = this.reInvalid
		, re = this.reEndPeriod;
	ext = ext ? '.'+ext.substr(0, 8) : '';
	name = name
		.substr(0, 128-ext.length)
		.concat(ext);
	ri && (name = name.replace(ri, ''));
	re && (name = name.replace(re, ''));
	return name;
};

Writer.prototype.setName = function(name, ext) {
	return this.setRawName( this.prepareName(name, ext) );
};

Writer.prototype.setRawName = function(name) {
	this.name = name;
	return this;
};

Writer.prototype.pipe = function(req) {
	req.pipe( this.getWriteStream() );
	return this;
};

Writer.prototype.save = function(data) {
	var ws = this.getWriteStream();
	ws.write(data);
	ws.end();
	return this;
};

Writer.prototype.onPath = function(err, path) {
	if (err) return this.onError(err);
	console.log('REAL: '+path);
};

Writer.prototype.onError = function(err) {
	console.log('ERROR WRITING FILE "'+this.path+'":');
	console.log(err);
};

Writer.prototype.onFinish = function() {
	console.log('FILE "'+this.name+'" SAVED');
};

export default Writer;