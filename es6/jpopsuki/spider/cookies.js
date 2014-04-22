var re = /^([^;]*)(?:;|$)/;

function cookies(c) {
	var a = [], m;
	for ( var i = 0, ii = c.length; i < ii; i++ ) {
		(m = c[i].match(re)) && (a[i] = m[1]);
	}
	return a.join('; ');
}

export default cookies;