import url from 'url';
import ent from 'entities';

function parseUrl(a) {
	return url.parse(
		ent.decode(a.attribs.href)
	, true);
}

export default parseUrl;