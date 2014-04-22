var doneMap = {};

function saveCover(dir, json) {
	if ( dir in doneMap ) {
		return;
	} else {
		doneMap[dir] = true;
	}
	console.log(dir+' - '+json.info.artist.name);
}

export default saveCover;