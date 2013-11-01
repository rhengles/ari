import parser from './parser';
import parsePage from './parsePage';
import writer from './writer';

function converter(opt) {
	parser(
		{ path: [opt.pathIn, opt.file.name].join('/')
		, cb: function(dom) {
				//console.log(dom);
				dom = JSON.stringify(parsePage(dom, opt.file.filter), null, '\t');
				writer( [opt.pathOut, opt.file.filter+'.json'].join('/'), dom );
			}
		});
}

export default converter;