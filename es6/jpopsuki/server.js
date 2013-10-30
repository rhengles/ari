import http from 'http';
import Writer from './writer';

http.createServer(function (req, res) {
	var w;
  console.log(req.method+' '+req.url+' HTTP/'+req.httpVersion);
  if ( req.method === 'POST' ) {
    req.setEncoding('utf8');
		w = new Writer;
		w.name = req.url.replace(/\W/g, '').substr(0, 64).concat('.html');
		w.saveAs(req, req.url, 'html');
    req.on('data', function(chunk) {
      console.log(chunk.substr(0, 80));
    });
  }
  req.on('end', function() {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  });
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');