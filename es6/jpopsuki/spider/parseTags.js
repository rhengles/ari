import hp from 'htmlparser2';
import getText from '../getText';

var du = hp.DomUtils;
var reTags = /^[^?]*torrents\.php\?(?:[^#]*(?:=[^#]*)&)*searchtags=([^&#]+)(?:[&#].*)?$/i;

function parseTags(elem) {
	return du.findAll(function(elem) {
		return (elem.name === 'a')
			&& (elem.attribs)
			&& reTags.test(elem.attribs.href || '');
	}, elem.children).map(function(elem) {
		return getText(elem);
	});
}

export default parseTags;