document.addEventListener( "DOMContentLoaded", function() {
	
	// listener for when dump finished
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.target=="popup") {
			process_message(request, sender, sendResponse);
		}
	});
	
	// make pos dump button ask for data
	document.getElementById("generate-data-dump").addEventListener("click", function () {
		document.getElementById("results").value="Loading";
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			chrome.tabs.sendMessage(tabs[0].id, {title: "generate-data-dump"}, function(response) {});  
		});
	});
});

function process_message(request, sender, sendResponse) {
	console.log(request);
	//interpret modifications
	switch (request.title) {
		case "dump-results":
			document.getElementById("results").value=request.results;
			break;
		default:
	}
}