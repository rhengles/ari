var h =
		//{ 'Connection': 'keep-alive'
		{ 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
		//, 'Accept-Encoding': 'gzip,deflate,sdch'
		, 'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4'
		, 'Origin': 'http://jpopsuki.eu'
		, 'Referer': 'http://jpopsuki.eu/'
		, 'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1933.0 Safari/537.36'
		//, 'If-Modified-Since': 'Mon, 21 Apr 2014 17:23:45 GMT'
		}
	, headers =
		{ object: h
		, extend: function(o) {
				var n = {};
				for ( var k in h ) {
					n[k] = h[k];
				}
				for ( var k in o ) {
					n[k] = o[k];
				}
				return n;
			}
		};

export default headers;