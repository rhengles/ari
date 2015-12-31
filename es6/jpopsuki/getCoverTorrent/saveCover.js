var doneMap = {};

function saveCover(dir, json) {
	// @TODO
	if ( dir in doneMap ) {
		return;
	} else {
		doneMap[dir] = true;
	}
	var name = json.info.artist.name;
	console.log(dir+(name===dir?'':' - '+name));
}

export default saveCover;