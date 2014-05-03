import http from 'http';
import qs from 'querystring';
import hp from 'htmlparser2';
import jsonPrint from './jsonprint';

function Request() {
	arguments.length && this.reset.apply(this, arguments);
}

Request.prototype.info = function() {
	var req = this.opt.req
		, m = req.method || 'GET'
		, p = req.path || '/';
	return m.concat(' ', p);
};
Request.prototype.reset = function(opt) {
	this.opt = opt || {};
	return this.load();
};
Request.prototype.load = function() {
	return this
		.parseOpt()
		.handleBody()
		.beforeLoad()
		.open()
		.bindError()
		.send();
};
Request.prototype.parseOpt = function() {
	var opt = this.opt
		, gb = opt.getBody
		, req = opt.proxy ? opt.proxy(opt.req) : opt.req;
	opt.getBody = gb == null || !!gb; // if unset, set to true
	opt.getDom && this.initParser();
	return this;
};
Request.prototype.initParser = function() {
	var self = this
		, handler = new hp.DomHandler(function(err, dom) {
				if ( err ) {
					console.log('Error parsing '+req.info());
					console.log(err);
				} else {
					self.domReady(dom);
				}
			});
	this.hp = hp;
	this.parser = new hp.Parser(handler);
	return this;
};
Request.prototype.domReady = function(dom) {
	this.res.dom = dom;
	this.opt.done.call(this, this.res, this.req);
	return this;
};
Request.prototype.handleBody = function() {
	var opt = this.opt
		, head = opt.req.headers
		, body = opt.body
		, ct = 'Content-Type'
		, cl = 'Content-Length';
	if ( body ) {
		opt.body = body = this.formatBody(body);
		if ( !head ) {
			opt.req.headers = head = {};
		}
		if ( !head[ct] ) {
			head[ct] = 'application/x-www-form-urlencoded';
		}
		if ( !head[cl] ) {
			head[cl] = Buffer.byteLength(body)
		}
	}
	return this;
};
Request.prototype.formatBody = function(body) {
	if ( typeof body === 'string' ) {
		return body;
	} else if ( typeof body === 'object' ) {
		this.opt.bodyObj = body;
		return qs.stringify(body);
	}
};
Request.prototype.beforeLoad = function() {
	var bl = this.opt.beforeLoad;
	bl && bl.call(this);
	return this;
};
Request.prototype.open = function() {
  this.req = http.request( this.opt.req, this.onResponse.bind(this) );
	return this;
};
Request.prototype.bindError = function() {
	var self = this
		, cb = this.opt.fail;
	!cb && cb !== false && (cb = this.onError);
	cb && this.req.on('error', function() {
		cb.apply(self, arguments);
	});
	return this;
};
Request.prototype.send = function() {
	var body = this.opt.body;
	body && this.req.write(body);
	this.req.end();
	return this;
};
Request.prototype.onError = function(e) {
	console.log('ERROR: '.concat(e.message, ' (', this.info(), ')'));
};
Request.prototype.onResponse = function(res) {
	var self = this
		, opt = this.opt
		, cb = opt.done
		, data = opt.onData
		, getBody = opt.getBody
		, getDom = opt.getDom
		, body = '';
	this.res = res;
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		data && data.apply(self, arguments);
		getBody && (body += chunk);
		getDom && self.parser.write(chunk);
	});
	cb && res.on('end', function() {
		getBody && (res.body = body);
		if ( getDom ) {
			self.parser.done();
		} else {
			cb.call(self, res, self.req);
		}
	});
};

export default Request;
