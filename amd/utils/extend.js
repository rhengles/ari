define(
[],
function() {

var main
	, extend = function() {
	return main.apply(void 0, arguments);
};

main = extend.one = function(target, source) {
	for ( var k in source ) {
		if ( !source.hasOwnProperty(k) ) continue;
		target[k] = source[k];
	}
	return target;
};

extend.many = function() {
	var args = Array.apply([], arguments)
		, target = args.shift()
		, source;
	while (source = args.shift()) {
		extend.one(target, source);
	}
	return target;
};

return extend;
});