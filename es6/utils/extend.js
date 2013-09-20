
var extend = {};

extend.one = function(target, source) {
	for ( var k in source ) {
		if ( !source.hasOwnProperty(k) ) continue;
		target[k] = source[k];
	}
	return target;
};

export default extend;