import html from 'html';
import js from 'js';

export default function componentSource(opt) {
	opt.js = js;
	opt.html = html;
	return opt.componentFactory(opt);
};
