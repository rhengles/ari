function All() {
	this.reset();
}

All.prototype.reset = function() {
	this.pending = {};
	this.solved = {};
};
All.prototype.then = function(cb) {
	this.done = cb;
	return this;
};
All.prototype.getCb = function(key) {
	if ( key in this.pending
		|| key in this.solved ) {
		throw new Error('Duplicate key '+key);
	}
	var all = this;
	this.pending[key] = true;
	return function() {
		all.solve(key, arguments); //Array.prototype.slice.call()
	};
};
All.prototype.solve = function(key, value) {
	if ( key in this.solved ) {
		throw new Error('Key '+key+' already solved');
	}
	if ( !( key in this.pending ) ) {
		throw new Error('Key '+key+' not registered');
	}
	this.solved[key] = value;
	delete this.pending[key];
	this.checkAllDone();
};
All.prototype.checkAllDone = function() {
	for ( var k in this.pending ) {
		return;
	}
	return this.done.call(this.solved);
};

export default All;