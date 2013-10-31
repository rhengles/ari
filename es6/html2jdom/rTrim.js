function rTrim(text, trim) {
	if ( text === trim ) return;
	trim = ' ('+trim+')';
	var tlen = text.length
		, rlen = trim.length
		, bef = tlen - rlen;
	return (
		( bef > 0 ) &&
		( text.substr( bef ) === trim ) )
		? text.substr( 0, bef )
		: text;
}

export default rTrim;