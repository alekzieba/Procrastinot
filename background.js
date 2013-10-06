// -------------------------------
// Procrastinate Extension for Chrome: background.js
// This is the script for the BACKGROUND of the extension.
// Written 8/10/13 by Alek Zieba.
// --
// All functions return VOID unless otherwise stated.
// This script is meant to run in the background.
// -------------------------------

// Create necessary variables.
// Storage variables.
var procrastinationTime;
var on;
var procrastinatedDate;
var websites;
var timing;
var isBlockList;

// Other variables.
var procrastinationTimer;
var canProcrastinate = true;
var date = (new Date()).toDateString();

// Execute the document when called.
function start() {

	// Get items from storage.
	getItemsFromStorage();

	// Add listeners for storage changes.
	addStorageListeners();
	
	// Add the listener for detecting if you go to a procrastination website.
	addWebsiteListener();
	
	// Add the alarm listener.
	addAlarmListener();

}

// Sets the on or off icon.
function setIconOn(on) { // Parameter is a boolean.

	var imagePath;

	if (on) {
		imagePath = 'icon.png';
	} else {
		imagePath = 'icon-off.png';
	}
	
	chrome.browserAction.setIcon({'path': imagePath})
}

// Add the alarm listener to show a destop notification when done.
function addAlarmListener() {
	chrome.alarms.onAlarm.addListener(function (alarm) {
		if (alarm.name == "focusAlarm") {
			var options = {
				type: "basic",
				title: "Done Focusing!",
				message: "You are done focusing!",
				iconUrl: chrome.extension.getURL('icon-off.png')
			}
			
			var d = new Date();
			
					
			chrome.notifications.create("donefocusing" + parseInt(d.getTime()), options, function (notificationID) {
				// Works!
			});
			on = false;
			timing = false;
			setIconOn(false);
			saveChanges();
			chrome.alarms.clearAll();
			
		}
	});
	
}

// Get the domain name of a URL.
// Returns a string if works, null if it doesn't.
function getDomainName(URL) { // Parameter is a string.

	// Check to see if you can get a domain name from the given URL.
	// Returns string if successful and null if not.
	function testSlash(URL, indexOfSlash) {

		// Check to see if the slash in a URL is valid.
		// Returns boolean.
		function slashIsValid(slash) { // Parameter is an integer.
			if (slash && (slash > 4)) {
				return true;
			}
			return false;
		} 


		if (slashIsValid(indexOfSlash)) {
			URL = URL.substr(0, indexOfSlash);
			return URL;
		} else if (indexOfSlash == -1) {
			return URL;
		}
		return null;
	}


	var prefixes = ["http://www.", "https://www.", "www.", "http://", "https://"];
	
	for (var i = 0; i < prefixes.length; i++) {
		if (URL.indexOf(prefixes[i]) == 0) {
			var beginning = prefixes[i].length;
			var modifiedURL = URL.substr(beginning, URL.length - beginning);
			var indexOfSlash = modifiedURL.indexOf("/");
			
			return testSlash(modifiedURL, indexOfSlash);
			
		}
	}
	
	var indexOfSlash = URL.indexOf("/");
	
	
	
	
	
	return testSlash(URL, indexOfSlash);
	
	
}


// Sets the on or off icon.
function setIconOn(on) { // Parameter is a boolean.

	var imagePath;

	if (on) {
		imagePath = 'icon.png';
	} else {
		imagePath = 'icon-off.png';
	}
	
	chrome.browserAction.setIcon({'path': imagePath})
}


// Sees if you go to procrastination website and attempts to stop you.
function addWebsiteListener() {
	
	chrome.webRequest.onBeforeRequest.addListener( function(details) {
		for (var i = 0; i < websites.length; i++) {
			if (isBlockList == 'block') {
				if (on && getDomainName(details.url) == websites[i]) {
					return {redirectUrl: chrome.extension.getURL("redirect.html")};
				}
			} else {
				if (on && getDomainName(details.url) != websites[i]) {
					return {redirectUrl: chrome.extension.getURL("redirect.html")};
				}
			}
		}
	},
	{
		urls: ["http://*/*", "https://*/*"],
		types: ["main_frame"]
	},
	["blocking"]);
	
}

// Get and set up items from storage.
function getItemsFromStorage() {
	
	// Get Procrastination Time and convert from minutes to milliseconds.
	try {
		chrome.storage.sync.get('time', function(fetched) {
			procrastinationTime = fetched.time;
			if (!(procrastinationTime)) {
				procrastinationTime = 0;
			}
		});
	} catch (error) {
		// Do nothing.
	}
	

	// See if the procrastination extension is on.
	try {
		chrome.storage.sync.get('on', function(fetched) {
			on = fetched.on;
			if (!(on)) {
				on = false;
			}
			
			// Set browser action icon.
			setIconOn(on);
			
		});
	} catch (error) {
		// Do nothing.
	}
	
	// Get the websites.
	try {
		chrome.storage.sync.get('websites', function(fetched) {
			websites = fetched.websites;
			if (!(websites)) {
				websites = new Array();
			}
		});
	} catch (error) {
		// Do nothing.
	}
	
	// Get the last date you fully procrastinated and see if you can procrastinate.
	try {
		procrastinationDate = chrome.storage.sync.get('date', function(fetched) {
			procrastinationDate = fetched.date;
			if (!(procrastinationDate)) {
				procrastinationDate = (new Date()).toDateString();
			}
		});
	} catch (error) {
		// Do nothing.
	}
	
	// Get the websites.
	try {
		chrome.storage.sync.get('block', function(fetched) {
			isBlockList = fetched.block;
			if (!(isBlockList)) {
				isBlockList = 'block';
			}
		});
	} catch (error) {
		// Do nothing.
	}

	
}

// Start the procrastination timer if the extension is turned on.
/*
function startProcrastinationTimer() {
	if (on) {
		chrome.alarms.create('procrastinationTimer', Date.now() + procrastinationTime);
	}
}
*/

// Called when procrastination timer goes off.
function procrastinationTimerUp() {	
	canProcrastinate = false;
	chrome.storage.sync.set(
	{
		'date': date
	});
	
}

// Add listeners to detect when items in storage have changed.
function addStorageListeners() {

	var type = "sync";

	// Detect when something changed.
	chrome.storage.onChanged.addListener(function(changes, namespace) {
				
		if (changes.on) {
			on = changes.on.newValue;
		}
		
		if (changes.websites) {
			websites = changes.websites.newValue;
			
		}
		
		if (changes.block) {
			isBlockList = changes.block.newValue;
		}
		
		if (changes.time) {
			procrastinationTime = changes.time.newValue;
		}
		
		if (changes.timing) {
			timing = changes.timing.newValue;
			
			if (timing) {
			
				var millisec = procrastinationTime * 60.0 * 1000.0;
				var d = new Date();
				var goOff = millisec + d.getTime();
				
				chrome.alarms.create("focusAlarm", {when: goOff});
			
				var options = {
					type: "basic",
					title: "Focusing!",
					message: "You have chosen to focus for " + procrastinationTime + " minute(s)!",
					iconUrl: chrome.extension.getURL('icon.png')
				}
				
				chrome.notifications.create("focusing" + parseInt(d.getTime()), options, function (notificationID) {
					// Works!
				});
			}
			
		}
		
		
	});
	
}




// Save storage changes.
function saveChanges() {

	chrome.storage.sync.set({
		'on':on,
		'time':procrastinationTime,
		'websites':websites,
		'timing': timing
	});
	
}


// Begin the document execution.
start();



