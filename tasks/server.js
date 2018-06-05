/*eslint no-console:0*/

var fs = require('fs');
var path = require('path');
var express = require('express');
var proxy = require('express-http-proxy');
var url = require('url');

var serverPortal = 'v2.portalrevendedor.shiftinc.com.br';
//var serverPortal = 'portalrevendedor.homolog.sirius.com.br';

var app = express();

var port = 8580;

function pathRel(p) {
    return path.join(__dirname, p);
}

function configServer(pagesHtml) {

    var proxyOriginal = proxy(serverPortal, {
        forwardPath: function (req, res) {
            return url.parse(req.originalUrl).path;
        }
    });
    

    app.get('/mockup/*', function(req, res){
        res.setHeader('Content-Type', 'application/json');
        var path = req.originalUrl.split('?');
        var regRemoveSlash = /\//g;
        var file = path[0].replace('/mockup/', '').replace(regRemoveSlash,'-').toLowerCase();
        fs.readFile(pathRel('../mockup/' + file + '.json'), 'utf-8', function (err, page) {
            if (err) {
                console.log('Request to ' + req.originalUrl + '. Status 404. File : ' + file + '.json');
                res.sendStatus(404);
            }
            else if (page) {
                console.log('Request to ' + req.originalUrl + '. Status 200');
                res.send(page);
            }
        });

    });
    app.use('/api', proxyOriginal);

    app.use('/chocottone', proxyOriginal);

    app.use('/noapi', proxy(serverPortal, {
        forwardPath: function(req, res) {
            return url.parse(req.url).path;
        }
    }));

    app.use(express.static(pathRel('../web')));

    app.get('*', function(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(
            req.query.nocachebuster
                ? pagesHtml.cache
                : pagesHtml.index
        );
        res.end();
    });

    app.listen(port, function() {
        console.log('Server running on port ' + port);
    });

}

var pages = {};

function onPageLoad() {
  if (pages.index && pages.cache) {
    configServer(pages);
  }
}

fs.readFile(pathRel('../web/index.html'), 'utf-8', function(err, page) {
    if (err) throw err;
    pages.index = page;
    onPageLoad();
    //configServer(page);
});

fs.readFile(pathRel('../web/cache.html'), 'utf-8', function(err, page) {
    if (err) throw err;
    pages.cache = page;
    onPageLoad();
    //configServer(page);
});
