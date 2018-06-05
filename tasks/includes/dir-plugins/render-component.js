var renderComponent = require('../../render-component');

module.exports = function dfpRenderComponentOpt(opt) {
	// console.log('init renderComponent', opt);
	opt || (opt = {});
	var onStart = opt.onStart;
	var onFinish = opt.onFinish;
	return function dfpRenderComponent(file, callback) {
		var comp = file.component;
		// console.log('if rccomp', comp);
		var cName = comp.name;
		if (cName) {
			var resultList = (this.result || {}).list;
			//,console.log(cDir);
			var config = {
				component: comp,
				// dirFiles: this,
				onBundle: opt.onBundle,
				onGenerate: opt.onGenerate,
				onOpenDir: opt.onOpenDir
			};
			onStart && onStart(config);
			renderComponent(config).then(function() {
				//,console.log('rc/done');
				if ( resultList ) {
					resultList.push(comp.path);
				}
				onFinish && onFinish(config);
				// console.log('rcsuccess', comp);
				callback();
			}, function(err) {
				//console.log('rc/error');
				//console.error(err);
				//console.log(err.stack);
				onFinish && onFinish(config, err);
				// console.log('rcfail', comp);
				callback(err);
			});
		} else {
			process.nextTick(callback);
		}
	}
};
