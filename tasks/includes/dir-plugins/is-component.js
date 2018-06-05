var path = require('path');

module.exports = function dfpIsComponent(opt) {
	var optAfter = opt && opt.after;
	return {
		name: 'isComponent',
		pluginTimeIgnore: true,
		sync: function(file) {
			var dirSub = file.dir.sub;
			if ( !file.name && dirSub ) {
				var dirFiles = file.dir.files;
				var last = path.basename(dirSub);
				var lastLen = last.length;
				var count = dirFiles.length;
				var comp_html;
				var comp_js;
				var comp_scss;
				var comp_static;
				var others = [];
				for ( var i = 0; i < count; i++ ) {
					var df = dirFiles[i];
					if (df == 'static') {
						comp_static = df;
						continue;
					}
					if (df.substr(lastLen) == '.html') {
						comp_html = df;
						continue;
					}
					if (df.substr(lastLen) == '.js') {
						comp_js = df;
						continue;
					}
					if (df.substr(lastLen) == '.scss') {
						comp_scss = df;
						continue;
					}
					others.push(df);
				}
				if (comp_html && comp_js) {
					file.component = {
						name: last,
						path: dirSub.replace(/\\/g,'/'),
						html: comp_html,
						js: comp_js,
						scss: comp_scss,
						staticdir: comp_static,
						others: others
					};
				}
			}
			(optAfter instanceof Function) && optAfter.call(this, file);
		}
	};
};
