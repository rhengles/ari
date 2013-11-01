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
SaveArtist.prototype.save = function(json) {
	var artist = json.info.artist.name
		, folder = artist in this.folders
		, build = artist in this.build;
	( folder
	? console.log('Pasta existe '+artist)
	: ( build
		? console.log('Pasta saindo '+artist)
		: this.create(artist)
		)
	);
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