//setup listener in case popup left open when results returned
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	process_message(request, sender, sendResponse);
});

function process_message(request, sender, sendResponse) {
	//interpret modifications
	switch (request.title) {
		case "generate-data-dump":
			download_pos_db();
			break;
		default:
	}
}

function download_pos_db() {
	var db_dump = {};
	db_dump.local = {};
	db_dump.indexdb = {};
	var global_record_countdown = 0;
	var dLink;
	var db;

	var localDataKeys = Object.keys(localStorage);;
	//for every objecttore opena  cursor and iterate
	for (ldki = 0; ldki < localDataKeys.length; ldki++) {
		curLocalDataKey = localDataKeys[ldki];
		db_dump.local[curLocalDataKey] = localStorage[curLocalDataKey];
	}

	var req = indexedDB.open("PosDatabase");

	// if upgradeneeded then the db doesn;t exist and your not on a pos window
	req.onupgradeneeded = function() {
		console.log("db doesn't exist");
	}

	// db exists we gonn connect to it
	req.onsuccess = function(event) {
		db = event.target.result;

		//generic error handle that just prints the error out
		db.onerror = function(event) {
		  // Generic error handler for all errors targeted at this database's
		  // requests!
		  alert("Database error: " + event.target.errorCode);
		};
		
		// grab all the objectstore names cause we gonna iterate over them all
		var allStores = db.objectStoreNames;
		var allStoreKeys = Object.keys(allStores);
		global_record_countdown = allStoreKeys.length;
		//for every objecttore opena  cursor and iterate
		for (aski = 0; aski < allStoreKeys.length; aski++) {

			curStoreName = allStores[allStoreKeys[aski]];
			var curObjStore = db.transaction(curStoreName).objectStore(curStoreName);
			
			curObjStore.openCursor().onsuccess = function(event) {
				var cursor = event.target.result;			
				if (cursor) {
					var curTable = event.target.source.name;
					
					// check if table made in json if no make it
					if (db_dump.indexdb[curTable] == undefined) {
						db_dump.indexdb[curTable] = {};
					}
					db_dump.indexdb[curTable][cursor.key] = cursor.value;
					cursor.continue();
				} else {
					global_record_countdown--;
					
					if (global_record_countdown <=0){
						// send log to popup
						chrome.runtime.sendMessage({target:"popup",title:"dump-results",results:JSON.stringify(db_dump)}, function() {});
					}
				}
			}
			
		}
		

	  
	};
}

