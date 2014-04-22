import http from 'http';
import qs from 'querystring';
import jsonPrint from './jsonprint';

function Request() {
	arguments.length && this.reset.apply(this, arguments);
}

Request.prototype.reset = function(opt) {
	this.opt = opt || {};
	return this.load();
};
Request.prototype.load = function() {
	var self = this
		, opt = this.opt
		, req = opt.proxy ? opt.proxy(opt.req) : opt.req;
	this.handleBody().beforeLoad();
  this.req = http.request( req, this.onResponse.bind(this) );
	return this
		.bindError()
		.send();
};
Request.prototype.beforeLoad = function() {
	var bl = this.opt.beforeLoad;
	bl && bl.call(this);
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
Request.prototype.bindError = function() {
	var self = this
		, cb = this.opt.fail;
	!cb && cb !== false && (cb = this.onError);
	cb && this.req.on('error', function() {
		cb.apply(self, arguments);
	});
	return this;
};
Request.prototype.info = function() {
	var req = this.opt.req
		, m = req.method || 'GET'
		, p = req.path || '/';
	return m.concat(' ', p);
};
Request.prototype.onError = function(e) {
	console.log('ERROR: '.concat(e.message, ' (', this.info(), ')'));
};
Request.prototype.send = function() {
	var body = this.opt.body;
	body && this.req.write(body);
	this.req.end();
	return this;
};
Request.prototype.onResponse = function(res) {
	var self = this
		, cb = this.opt.done
		, data = this.opt.onData
		, body = '';
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		if ( data ) {
			data.apply(self, arguments);
		} else {
			body += chunk;
		}
	});
	cb && res.on('end', function() {
		res.body = body;
		cb.call(self, res, self.req);
	});
}

export default Request;
