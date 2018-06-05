var node_path = require('path');
var fs = require('fs');
var Q = require('q');
var rollup = require('rollup');
var buble = require('rollup-plugin-buble');
var stringPlugin = require('rollup-plugin-string');
var alias = require('rollup-plugin-alias');
var hypothetical = require('rollup-plugin-hypothetical');
var openDir = require('./includes/open-dir');

function pathRel(p) {
	return node_path.join(__dirname, p).replace(/\\/g, '/');
}

var componentSource = pathRel('./includes/component-source.js');
var base = pathRel('../src/components');
var mapBundleModules = {
	html: true,
	js: true,
	meta: true
};
mapBundleModules[componentSource] = true;

function componentAliases(path) {
	path = [base].concat(path).join('/');
	return {
		html: path+'.html',
		js: path+'.js'
	};
}

function rollupBundle(opt) {
	var comp = opt.component;
	var entry = [comp.path, comp.name].join('/');
	opt.entry = entry;
	var aliases = componentAliases(entry);
	//console.log('R/ALI', aliases);
	aliases.resolve = [''];
	mapBundleModules[aliases.html] = true;
	mapBundleModules[aliases.js] = true;
	return rollup.rollup({
		entry: componentSource,
		plugins: [
			alias(aliases),
			stringPlugin({
				include: '**/*.html'
			}),
			hypothetical({
				allowRealFiles: true,
				leaveIdsAlone: true,
				files: {
					meta: 'export default '+JSON.stringify({
						path: comp.path,
						name: comp.name,
						dirFiles: opt.dirFiles
					})+';'
				}
			}),
			buble()
		],
		external: function(path) {
			var isInternal = Boolean(mapBundleModules[path]);
			//console.log('R/EXT', path, isInternal);
			return !isInternal;
		}
	}).then(function(bundle) {
		opt.bundle = bundle;
		return opt;
	});
}

function rollupGenerate(opt) {
	//,console.log(bundle);
	var onBundle = opt.onBundle;
	if (onBundle instanceof Function) {
		onBundle(opt);
	}
	var bundle = opt.bundle;
	opt.bundle = void 0;
	opt.result = bundle.generate({
		format: 'amd',
		//dest: pathRel('../web/components/' + entry + '.js'),
		moduleId: 'components/'+opt.component.path
	});
	return opt;
}

function rollupOpenDir(opt, callback) {
	openDir.array(
		pathRel('../web/components'),
		opt.component.path.split('/'),
		function(err) {
			return callback(err, this);
		}
	);
}

function rollupWriteFile(opt, callback) {
	fs.writeFile(
		pathRel('../web/components/' + opt.entry + '.js'),
		opt.result.code,
		callback
	);
}

function rollupWrite(opt) {
	var onGenerate = opt.onGenerate;
	if (onGenerate instanceof Function) {
		onGenerate(opt);
	}
	var deferred = Q.defer();
	rollupOpenDir(opt, function(err, dirStats) {
		opt.component.dir = dirStats;
		if (err) return deferred.reject(err);
		var onOpenDir = opt.onOpenDir;
		if (onOpenDir instanceof Function) {
			onOpenDir(opt);
		}
		rollupWriteFile(opt, function(err) {
			if (err) return deferred.reject(err);
			opt.result = void 0;
			deferred.resolve(opt);
		});
	});
	return deferred.promise;
}

function renderComponent(opt) {
	return Q.Promise(function(resolve) {
		resolve(opt);
	})
	.then(rollupBundle)
	.then(rollupGenerate)
	.then(rollupWrite);
}

module.exports = renderComponent;
