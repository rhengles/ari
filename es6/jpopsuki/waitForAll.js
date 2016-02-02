
function waitForAll() {
	function cbItem() {
		done += 1;
		check();
	}
	function add() {
		total += 1;
		return cbItem;
	}
	function ready(cb) {
		then = cb;
		check();
	}
	function check() {
		if ( then && done == total ) {
			then(done);
		}
	}
	var total = 0;
	var done = 0;
	var then;
	add.ready = ready;
	return add;
}

export default waitForAll;
