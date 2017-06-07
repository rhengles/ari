
// DevTools page -- devtools.js
// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
	name: "devtools-page"
});

backgroundPageConnection.onMessage.addListener(function (message) {
	// Handle responses from the background page, if any
	console.log('bgPageMessage', message);
});
backgroundPageConnection.postMessage({
	name: 'initdev',
	tabId: chrome.devtools.inspectedWindow.tabId
});

chrome.devtools.panels.create("My Panel",
	"icon.png",
	"spider.html",
	function(panel) {
		// code invoked on panel creation
		backgroundPageConnection.postMessage({
			name: 'panelcreated',
			tabId: chrome.devtools.inspectedWindow.tabId
		});
	}
);
