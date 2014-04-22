import fs from 'fs';
import dirName from '../dirName';

function SaveArtist() {
	this.reset();
}

SaveArtist.prototype.reset = function() {
	this.folders = {};
	this.build = {};
	this.created = {};
	this.failed = {};
	this.cbFolder = [];
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
SaveArtist.prototype.onFolder = function(cb) {
	this.cbFolder = this.cbFolder
		.concat( cb instanceof Array
			? cb
			: ( cb
				? [ cb ]
				: []
				)
		);
	return this;
};
SaveArtist.prototype.callCbFolder = function(dir, json) {
	var c = this.cbFolder;
	for ( var i = 0, ii = c.length; i < ii; i++ ) {
		( c[i] instanceof Function ) &&
		( c[i].call(this, dir, json) );
	}
	return this;
};
SaveArtist.prototype.save = function(json) {
	var artist = json.info.artist;
	if ( artist ) {
		artist = dirName(artist.name);
		if ( artist in this.folders ) {
			this.log && console.log('Folder exists '+artist);
			this.callCbFolder(artist, json);
		} else if ( artist in this.build ) {
			this.log && console.log('Creating folder '+artist);
		} else {
			this.create(artist, json);
		}
	}
	this.done && this.checkDone();
};
SaveArtist.prototype.create = function(dir, json) {
	this.build[dir] = true;
	fs.mkdir(
		[this.path, dir].join('/')
	, (function(err) {
			delete this.build[dir];
			if (err) {
				this.failed[dir] = err;
				console.log('Error creating '+dir);
				console.log(err);
			} else {
        this.created[dir] = true;
        this.folders[dir] = true;
        this.log && console.log('Folder created '+dir);
				this.callCbFolder(dir, json);
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