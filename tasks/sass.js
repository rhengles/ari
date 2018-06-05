/*eslint no-console:0*/

var fs = require('fs');
var node_path = require('path');
var sass = require('node-sass');
var dirFiles = require('./includes/dir-files');
var openDir = require('./includes/open-dir');

var pathSass = pathRel('../src/sass/index.scss');
var pathRoot = pathRel('..');
var pathCssDir = ['web', 'css'];
var pathCssBase = [pathRoot].concat(pathCssDir).join('/');
var pathCssFile = node_path.join(pathCssBase, 'main.css');
var pathCssMap = node_path.join(pathCssBase, 'main.css.map');
var pathComp = pathRel('../src/components/');
var pathCompImport = pathRel('../src/sass/_components.scss');
var streamOpt = { defaultEncoding: 'utf8' };

function pathRel(p) {
    return node_path.join(__dirname, p);
}

function save(path, data, cb) {
    var stream = fs.createWriteStream(path, streamOpt);
    stream.end(data);
    stream.on('finish', cb);
    stream.on('error', cb);
}

function compileSass() {
    var logStream = fs.createWriteStream(pathRel('../src/sass/_components.scss', { flags: 'a' }));
    dirFiles({
        path: pathComp,
        rec: dirFiles.firstCharNot('._'),
        regexFile: /^(.*)\.scss$/,
        processFile: function(file, next) {
            var fpath = node_path.join(file.dir.sub, file.name); //File.dir.name,
            logStream.write("$dir: '../components/" + file.dir.sub.replace(/\\/g, '/') + "/';\n");
            logStream.write("@import '../components/" + fpath.replace(/\\/g, '/') + "';\n");
            next();
        },
        done: function() {
            logStream.end('');
            sass.render({
                file: pathSass,
                //outputStyle: 'compressed'
                outputStyle: 'expanded'
            }, function(error, result) { // Node-style callback from v3.0.0 onwards
                var doneCss = false;
                var doneMap = false;

                function done() {
                    if (doneCss && doneMap) {
                        console.log('file ' + node_path.relative(pathRel('..'), pathCssFile) + ' created successfully');
                        if (time) {
                            console.log('waiting ' + time + 's');
                            setTimeout(compileSass, time * 1000);
                        }
                    }
                }
                if (error) {
                    console.log(error.status); // Used to be 'code' in v2x and below
                    console.log(error.column);
                    console.log(error.message);
                    console.log(error.line);
                    process.exit(1); // Código para indicar término com erro
                } else {
                    //,console.log(result.stats);

                    openDir.array(pathRoot, pathCssDir, function(err) {
                        if (err) throw err;
                        save(pathCssFile, result.css, function(err) {
                            if (err) throw err;
                            //,console.log('saved css '+pathCss);
                            doneCss = true;
                            done();
                        });
                        //,console.log(result.css.toString());

                        if (result.map) {
                            save(pathCssMap, result.map, function(err) {
                                if (err) throw err;
                                //,console.log('saved map '+pathMap);
                                doneMap = true;
                                done();
                            });
                        } else {
                            doneMap = true;
                            done();
                        }
                    });

                }
            });
        }
    });
}

var time = +process.argv[2];

compileSass();
