
function onNavigated(url) {
	console.log('onNavigated', url);
	pageUrl = urlJson(new URL(url));
	backgroundPageConnection.postMessage({
		name: 'onNavigated',
		tabId: chrome.devtools.inspectedWindow.tabId,
		baseUrl: baseUrl,
		url: pageUrl
	});
}

function onRequestFinished(request) {
	if ( !pageUrl ) {
		console.log('onRequestFinished error', request);
		throw new Error('Empty page URL');
		return;
	}
	var url = urlJson(new URL(request.request.url));
	if ( url.host !== pageUrl.host ) {
		console.log('onRequestFinished '+url.href, request);
		return;
	}
	request.getContent(function(content, encoding) {
		console.log('onRequestContent '+url.pathname+url.search+url.hash, content.length, encoding, request);
		backgroundPageConnection.postMessage({
			name: 'onRequestContent',
			tabId: chrome.devtools.inspectedWindow.tabId,
			baseUrl: baseUrl,
			url: url,
			request: request,
			content: content,
			encoding: encoding
		});
	});
}

function start() {
	backgroundPageConnection.postMessage({
		name: 'test_remote',
		tabId: chrome.devtools.inspectedWindow.tabId,
		remote: txRemote.value
	});
	btStart.disabled = true;
	btStop.disabled = true;
	txRemote.disabled = true;
}

function spiderStart(msg, xhr) {
	console.log('start listening network');
	baseUrl = msg.remote;
	chrome.devtools.network.onNavigated.addListener(onNavigated);

	chrome.devtools.network.onRequestFinished.addListener(onRequestFinished);

	chrome.devtools.inspectedWindow.reload({
		ignoreCache: true
	});
}

function stop() {
	chrome.devtools.network.onNavigated.removeListener(onNavigated);

	chrome.devtools.network.onRequestFinished.removeListener(onRequestFinished);
	baseUrl = void 0;
	pageUrl = void 0;
	console.log('stop listening network');
}

function isSuccessXhr(xhr) {
	return xhr &&
		(xhr.readyState === 4) &&
		(xhr.status >= 200) &&
		(xhr.status < 300) &&
		xhr.statusText &&
		xhr.responseText;
}

function urlJson(url) {
	return {
		hash: url.hash,
		host: url.host,
		hostname: url.hostname,
		href: url.href,
		origin: url.origin,
		password: url.password,
		pathname: url.pathname,
		port: url.port,
		protocol: url.protocol,
		search: url.search,
		searchParams: [...url.searchParams.entries()],
		username: url.username
	};
}

chrome.devtools.inspectedWindow.eval('inspect($0)');
var btStart = document.querySelector('#start');
var btStop = document.querySelector('#stop');
var txRemote = document.querySelector('#remote');
var baseUrl;
var pageUrl;
btStart.addEventListener('click', start, false);
btStop.addEventListener('click', stop, false);

// DevTools page -- devtools.js
// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
	name: "devtools-sidebar"
});

backgroundPageConnection.onMessage.addListener(function (message) {
	// Handle responses from the background page, if any
	var name = message.name;
	if (name === 'test_remote_response') {
		var error = message.error;
		var load = message.load;
		var xhr = message.xhr;
		var msg = message.msg;
		if ( !error && load && msg && isSuccessXhr(xhr) ) {
			console.log('test_remote_response success', message);
			spiderStart(msg, xhr);
			return;
		}
		console.log('test_remote_response fail', message);
		btStart.disabled = false;
		btStop.disabled = false;
		txRemote.disabled = false;
		return;
	}
	console.log('bgPageMessage', message);
});
backgroundPageConnection.postMessage({
	name: 'init',
	tabId: chrome.devtools.inspectedWindow.tabId
});
