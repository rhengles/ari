import getArtists from './getartists';
import parseArtists from './parseArtists';
import saveAbstract from './saveAbstract';

function domainArtists() {
	return (
		{ get: getArtists
		, parse: parseArtists
		, dir: 'jpopsuki/json/artists/'
		});
}

function saveArtists(session, cb) {
	saveAbstract(domainArtists(), session, cb);
}

export default saveArtists;