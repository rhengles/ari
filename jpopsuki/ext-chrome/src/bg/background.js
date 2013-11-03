// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
//chrome.extension.onMessage.addListener(
//  function(request, sender, sendResponse) {
//  	chrome.pageAction.show(sender.tab.id);
//    sendResponse();
//  });
var rePage = /\bpage=(\d+)\b/;
function getPage(url) {
  url = url.match(rePage);
	return url
    ? parseInt( url[1], 10 )
    : Number.NaN;
}
chrome.browserAction.onClicked.addListener(function(tab) {
	var page = getPage(tab.url);
	function run() {
		chrome.tabs.executeScript(tab.id, {
			//code: 'document.body.style.backgroundColor="red"'
			file: 'src/injected.js'
		});
	}
	chrome.tabs.onUpdated.addListener(function(tid, evt) {
		if ( tid !== tab.id ) return;
		console.log(evt);
		if ( evt.url ) {
			tpg = getPage(evt.url);
			if ( tpg > page ) {
				page = tpg;
				run();
			}
		}
	}); 
	run();
});