var proxy = function(opt) {
  //return opt;
  var h = opt.host || (opt.hostname + (opt.port ? ':' + opt.port : ''));
  opt.path = 'http://'+h+opt.path;
  opt.headers || (opt.headers = {});
  opt.headers.Host = h;
  opt.hostname = '127.0.0.1';
  opt.port = 8888;
  opt.host = void 0;
  return opt;
}
proxy = null;

export default proxy;