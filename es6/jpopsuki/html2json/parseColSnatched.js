import getText from '../getText';

function parseColSnatched(td) {
	return (
		{ date: td.attribs.title
		, since: getText(td)
		});
}

export default parseColSnatched;