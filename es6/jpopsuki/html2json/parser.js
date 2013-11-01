import fs from 'fs';
import hp from 'htmlparser2';

function parse(opt) {
	function onErr(err) {
		( opt.cbErr
		? opt.cbErr(err)
		: console.log('ERRO: '+err)
		);
	}

	var rs = fs.createReadStream(opt.path)
		, handler = new hp.DomHandler(function(err, dom) {
				if ( err ) {
					onErr(err);
					return;
				}
				opt.cb(dom);
			})
		, parser = new hp.Parser(handler);
	rs.on('error', onErr);
	rs.on('data', function(chunk) {
		parser.write(chunk);
	});
	rs.on('end', function() {
		parser.done();
	});

}

export default parse;