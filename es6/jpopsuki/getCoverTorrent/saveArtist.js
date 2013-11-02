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
	this.checkDone(); // just in case
};
SaveArtist.prototype.checkDone = function() {
	for ( var k in this.build ) {
		return;
	}
	this.done();
};
SaveArtist.prototype.safeName = function(s) {
	return s
    .replace(/[:*]/g, '-')
    .replace(/\.+$/g, ''); // To avoid problems in Windows
  // see http://support.microsoft.com/?kbid=320081
};
SaveArtist.prototype.save = function(json) {
	var artist = this.safeName(json.info.artist.name);
	( artist in this.folders
	? this.log && console.log('Folder exists '+artist)
	: ( artist in this.build
		? this.log && console.log('Creating folder '+artist)
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
				this.failed[artist] = err;
				console.log('Error creating '+artist);
				console.log(err);
			} else {
        this.created[artist] = true;
        this.folders[artist] = true;
        this.log && console.log('Folder created '+artist);
      }
      this.done && this.checkDone();
		}).bind(this));
}
SaveArtist.prototype.countKeys = function(obj) {
  var i = 0;
  for ( var k in obj ) i++;
  return i;
};
SaveArtist.prototype.count = function() {
  return (
    { folders: this.countKeys(this.folders)
    , build:   this.countKeys(this.build  )
    , created: this.countKeys(this.created)
    , failed:  this.countKeys(this.failed )
    });
};

export default SaveArtist;