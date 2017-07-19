/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

	console.log(tab);
	
    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

var links = [];
var blacklist = ["", "#", "?", "/", "//", "javascript:void(0);", "undefined"];

function SortLinks(html, baseUrl) {
	$(html).find('a').each(function(index) {
		var url = $(this).attr('href');
		
		if (blacklist.indexOf(url) >= 0 || url.length == 1) {
			return true; // Do not show something that is within the blacklist
			// Or that has a lenght of 1, as it is likely useless
		}
		
		// Handle internal links
		if (url.charAt(0) == "/" || url.charAt(0) == "#") {
			url = baseUrl + url;
		}
		
		//&& blacklist.indexOf(url) < 0
		if (links.indexOf(url) < 0) {
			links.push(url);
			$('#links').append('<li><a href="' + url + '" target="_blank">' + url + '</a></li>');
		}
	});
	
	if (links.length == 0) {
		document.getElementById("error").innerText = "--No links found.";
	}
	else {
		document.getElementById("status").innerText = "Links found: " + links.length;
	}
}

document.addEventListener('DOMContentLoaded', function() {
	getCurrentTabUrl(function(url) {
		var req = new XMLHttpRequest();
		req.open('GET', url, false);
		req.send(null);
		
		if (req.status == 200) {
			var responseText = req.responseText;
			SortLinks(responseText, url);
		}
		else {
			document.getElementById("status").innerText = req.responseText;
		}
	});
});
