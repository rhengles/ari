import url from 'url';
import ent from 'entities';

function parseUrl(a, query) {
	return url.parse(
		ent.decode(a.attribs.href)
	, query == null ? true : query);
}

export default parseUrl;