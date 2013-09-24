
var extend = function() {
			return main.apply(null, arguments);
		}
	, main;

main = extend.one = function(options, target, source) {
	var filt = (options instanceof Function
			? options
			: (options && options.filter))
		, pick = options && options.pick
		, omit = options && options.omit
		, copy;
	for ( var k in source ) {
		copy = source.hasOwnProperty(k)
			&& (!pick || (k in target))
			&& (!omit || !(k in target))
			&& (!filt || filt(target, source, k));
		copy && (target[k] = source[k]);
	}
	return target;
};

extend.many = function(options, target) {
	var args = Array.prototype.slice.call(arguments, 2)
		, source;
	while ( source = args.shift() ) {
		extend.one(options, target, source);
	}
	return target;
};

extend.all = function(target, source) {
	return extend.many(null, target, source);
};

extend.pick = function() {
	var args = Array.prototype.slice.call(arguments);
	args.unshift({pick: true});
	return extend.many.apply(null, args);
};

extend.defaults = function() {
	var args = Array.prototype.slice.call(arguments);
	args.unshift({omit: true});
	return extend.many.apply(null, args);
};

extend.omit = function(omit) {
	var args = Array.prototype.slice.call(arguments, 1)
		, opt = function(target, source, k) {
				return !(k in omit);
			};
	args.unshift(opt);
	return extend.many.apply(null, args);
};

export default extend;