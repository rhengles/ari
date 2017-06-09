/*
// Background page -- background.js
chrome.runtime.onConnect.addListener(function(devToolsConnection) {
	// assign the listener function to a variable so we can remove it later
	var devToolsListener = function(message, sender, sendResponse) {
		console.log(message, sender, sendResponse);
	};
	// add the listener
	devToolsConnection.onMessage.addListener(devToolsListener);

	devToolsConnection.onDisconnect.addListener(function() {
		devToolsConnection.onMessage.removeListener(devToolsListener);
	});
});
*/

function ajax(opt) {
	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function(evt) {
		opt.callback({load: evt, xhr: xhr});
	}, false);
	xhr.addEventListener('error', function(evt) {
		opt.callback({error: evt, xhr: xhr});
	}, false);

	xhr.open(opt.method, opt.url);
	if (opt.type && opt.body) {
		xhr.setRequestHeader('Content-Type', opt.type);
	}
	var headers = opt.headers;
	var hcount = headers && headers.length || 0;
	for ( var i = 0; i < hcount; i++ ) {
		xhr.setRequestHeader(headers[i].name, headers[i].value);
	}

	xhr.send(opt.body || '');
}

function ajaxResponse(name, message, evt) {
	var xhr = evt.xhr;
	var load = evt.load;
	var error = evt.error;
	return {
		name: name,
		load: load && {
			type: load.type,
			loaded: load.loaded,
			total: load.total
		},
		error: error && {
			type: error.type,
			loaded: error.loaded,
			total: error.total
		},
		xhr: {
			status: evt.xhr.status,
			statusText: evt.xhr.statusText,
			readyState: evt.xhr.readyState,
			responseText: evt.xhr.responseText
		},
		msg: message
	};
}

function trimSlashes(str) {
	return str.replace(/^\/+|\/+$/g,'');
}

function mountPath(message) {
	var path = message.url.pathname;
	path = trimSlashes(path);
	var lastSlash = path.lastIndexOf('/');
	var base = path.substr(lastSlash+1);
	var lastDot = base.lastIndexOf('.');
	if (lastDot === -1) {
		path += (path ? '/': '') + 'index.html';
	}
	return trimSlashes(message.baseUrl) + '/' + path;
}

function getResponseType(message) {
	var response = message.request.response;
	var headers = response.headers;
	var count = headers.length;
	for ( var i = 0; i < count; i++ ) {
		var h = headers[i];
		if ( h.name === 'content-type' ) {
			return h.value;
		}
	}
	return (response.content.mimeType || 'text/plain') +
		'; charset=UTF-8';
}

// background.js
var connections = {};

chrome.runtime.onConnect.addListener(function (port) {

	//console.log('Connect', port);

  var extensionListener = function (message, sender, sendResponse) {

		var name = message.name;

		// The original connection event doesn't include the tab ID of the
		// DevTools page, so we need to send it explicitly.
		if (name == "init" || name == "initdev") {
			connections[message.tabId] = port;
			return;
		}

		if (name == "panelcreated") {
			return;
		}

		if (name == "test_remote") {
			ajax({
				method: 'get',
				url: message.remote,
				//body: 'test',
				callback: function(evt) {
					console.log('test_remote', message, evt);
					port.postMessage(
						ajaxResponse("test_remote_response", message, evt)
					);
				}
			});
			return;
		}

		if (name == "onNavigated") {
			ajax({
				method: 'get',
				url: mountPath(message),
				callback: function(evt) {
					console.log(
						ajaxResponse('onNavigated sent', message, evt)
					);
				}
			});
			return;
		}

		if (name == "onRequestContent") {
			ajax({
				method: 'post',
				url: mountPath(message),
				type: getResponseType(message),
				headers: message.encoding
					? [
							{
								name: 'X-Chrome-Encoding',
								value: message.encoding
							}
						]
					: null,
				body: message.content,
				callback: function(evt) {
					console.log(
						ajaxResponse('onRequestContent sent', message, evt)
					);
				}
			});
			return;
		}

		console.log('Message', message);//, sender, sendResponse);

// other message handling
  }

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener(function(port) {
    port.onMessage.removeListener(extensionListener);

    var tabs = Object.keys(connections);
    for (var i=0, len=tabs.length; i < len; i++) {
      var tabId = tabs[i];
      if (connections[tabId] == port) {
        delete connections[tabId];
        //break;
      }
    }
  });
});

/*
// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    var tabId = sender.tab.id;
    if (tabId in connections) {
      connections[tabId].postMessage(request);
    } else {
      console.log("Tab not found in connection list.");
    }
  } else {
    console.log("sender.tab not defined.");
  }
  return true;
});
*/
