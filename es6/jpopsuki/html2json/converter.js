import parser from './parser';
import parsePage from './parsePage';
import saveJson from '../saveJson';

function converter(opt) {
	parser(
		{ path: [opt.pathIn, opt.file.name].join('/')
		, cb: function(dom) {
				//console.log(dom);
				dom = parsePage(dom, opt.file.filter);
        saveJson( [opt.pathOut, opt.file.filter+'.json'].join('/'), dom );
			}
		});
}

export default converter;