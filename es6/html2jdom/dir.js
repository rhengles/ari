import fs from 'fs';

function dir(opt) {

	fs.readdir(opt.path, function(err, files) {
		if ( err ) {
			( opt.cbErr
			? opt.cbErr(err)
			: console.log('ERRO: '+err)
			);
			return;
		}
		var a = [];
		for ( var f in files ) {
			var t = files[f];
			if ( opt.filter ) {
				t = opt.filter(t);
				( t == null ) ||
				( t =
					{ filter: t
					, name: files[f]
					} );
			}
			t && a.push(t);
		}
		opt.sort && a.sort(opt.sort);
		opt.cb(a);
	});

}

export default dir;