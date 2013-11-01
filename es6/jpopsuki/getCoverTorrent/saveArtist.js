import fs from 'fs';

function SaveArtist() {
	this.reset();
}

SaveArtist.prototype.reset = function() {
	this.folders = {};
	this.build = {};
	this.created = {};
	this.failed = {};
};
SaveArtist.prototype.then = function(cb) {
	this.done = cb;
	this.checkDone(); // vai que...
};
SaveArtist.prototype.checkDone = function() {
	for ( var k in this.build ) {
		return;
	}
	this.done();
};
SaveArtist.prototype.safeName = function(s) {
	return s.replace(/[:*]/g, '-');
};
SaveArtist.prototype.save = function(json) {
	var artist = this.safeName(json.info.artist.name);
	( artist in this.folders
	? console.log('Pasta existe '+artist)
	: ( artist in this.build
		? console.log('Pasta saindo '+artist)
		: this.create(artist)
		)
	);
	this.done && this.checkDone();
};
SaveArtist.prototype.create = function(artist) {
	this.build[artist] = true;
	fs.mkdir(
		[this.path, artist].join('/')
	, (function(err) {
			delete this.build[artist];
			if (err) {
				console.log('Erro ao criar '+artist);
				console.log(err);
				this.failed[artist] = err;
				return;
			}
			this.created[artist] = true;
			this.folders[artist] = true;
			console.log('Pasta criada '+artist);
		}).bind(this));
}

export default SaveArtist;