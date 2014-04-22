var ease =
		{ linear: function(x) {
				return x;
			}
		, quad: function(x) {
				return x*x;
			}
		, cubic: function(x) {
				return x*x*x;
			}
		, quart: function(x) {
				return x*x*x*x;
			}
		}
	, mod =
		{ out: function(t, fn) {
				return 1-fn(1-t);
			}
		, twice: function(t, fn) {
				return fn(t*2)/2;
			}
		, inOut: function(t, fn) {
				return ( t < 0.5
					? twice(t, fn)
					: out(t, fnTwice(fn))
					);
			}
		, outIn: function(t, fn) {
				return ( t < 0.5
					? twice(t, fnOut(fn))
					: twice(t-0.5, fn)+0.5
					);
			}
		/**
		 * @param t
		 * Current time, starting at zero.
		 * @param b
		 * Starting value to ease.
		 * @param c
		 * Ending value.
		 * @param d
		 * Duration in time.
		 */
		, inter: function(t,b,c,d,fn) {
				return fn(t/d)*(c-b)+b;
			}
		}
	, fnMod =
		{ out: function(fn) {
				return function(t) {
					return mod.out(t, fn);
				};
			}
		, twice: function(fn) {
				return function(t) {
					return mod.twice(t,fn);
				};
			}
		, inOut: function(fn) {
				return function(t) {
					return mod.inOut(t, fn);
				};
			}
		, outIn: function(fn) {
				return function(t) {
					return mod.outIn(t, fn);
				};
			}
		, inter: function(fn) {
				return function(t,b,c,d) {
					return mod.inter(t,b,c,d,fn);
				};
			}
		}
	, obj =
		{ ease: ease
		, mod: mod
		, fnMod: fnMod
		};

export default obj;