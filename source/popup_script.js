// -------------------------------
// Procrastinate Extension for Chrome: popup_script.js
// This is the script for the POPUP of the extension.
// Written 8/9/13 by Alek Zieba.
// --
// All functions return VOID unless otherwise stated.
// -------------------------------

// Establish necessary variables.
var onCheckbox;
var timeTextfield;
var addWebsiteButton;
var clearWebsitesButton;
var startTimerButton;
var urlTextfield;
var themeSelectField;
var websites = new Array();
var displayTimeTimer;
var blockListRadio;
var isBlockList;
var shiftDown;

var maxMin = '180';
var timing;
var iconOnPath = 'images/icon_images/icon.png';
var iconOffPath = 'images/icon_images/icon-off.png';

// Called when HTML file finishes loading.
$(document).ready(function() {

	// Get references to form objects.
	establishFormElements();
	
	// Get local data.
	getLocalData();
	
	// Establish form input listeners.
	establishListeners();

});

// Sets the on or off icon.
function setIconOn(on) { // Parameter is a boolean.

	var imagePath;

	if (on) {
		imagePath = iconOnPath;
	} else {
		imagePath = iconOffPath;
	}
	
	chrome.browserAction.setIcon({'path': imagePath})
}

// Sets the "enabled" state of all desired form elements to the parameter specified.
function setEnabledFormElements(enabled) { // Parameter is a boolean.

	var currentRadioBlock = $('input:radio[name=block]:checked');

	if (currentRadioBlock.val() == 'block') {
		if (enabled) {
			
			clearWebsitesButton.prop('class', 'myButton');

		} else {
			
			clearWebsitesButton.prop('class', 'myButton2');
		}
		
		clearWebsitesButton.prop('disabled', !enabled);
		onCheckbox.prop('disabled', !enabled);
		blockListRadio.prop('disabled', !enabled);
		for (var i = 0; i < websites.length; i++) {
			var element = $('#button' + i);
			element.prop('disabled', !enabled);
			if (enabled) {
				element.prop('class', 'myButton');
			} else {
				element.prop('class', 'myButton2');
			}
		}
		
	}
	
	timeTextfield.prop('disabled', !enabled);
	startTimerButton.prop('disabled', !enabled);
	
	if (enabled) {
		startTimerButton.prop('class', 'myButton');
	} else {
		startTimerButton.prop('class', 'myButton2');
	}
	
	if (currentRadioBlock.val() == 'allow') {
		urlTextfield.prop('disabled', !enabled);
		addWebsiteButton.prop('disabled', !enabled);
		if (enabled) {
			addWebsiteButton.prop('class', 'myButton');
		} else {
			addWebsiteButton.prop('class', 'myButton2');
		}
	}
	
	
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
			var indexOfQ = modifiedURL.indexOf("?");
			
			if (indexOfQ > indexOfSlash) {
				indexOfSlash = indexOfQ;
			}
			
			return testSlash(modifiedURL, indexOfSlash);
			
		}
	}
	
	var indexOfSlash = URL.indexOf("/");
	var indexOfQ = URL.indexOf("?");
			
	if (indexOfQ > indexOfSlash) {
		indexOfSlash = indexOfQ;
	}
	
	
	
	
	return testSlash(URL, indexOfSlash);
	
	
}

// Get references to form elements.
function establishFormElements() {
	onCheckbox = $('#onCheckbox');
	timeTextfield = $('#timeTextfield');
	addWebsiteButton = $('#addWebsiteButton');
	clearWebsitesButton = $('#clearWebsitesButton');
	startTimerButton = $('#startTimerButton');
	urlTextfield = $('#urlTextfield');
	themeSelectField = $('#themeSelect');
	blockListRadio = $('input:radio[name=block]');
}

// Get local data from storage and assign it to variables.
function getLocalData() {

	// See if the user specified if block list and set it.
	try {
		chrome.storage.sync.get('block', function(fetched) {
			var localBlockData = fetched.block;
			if(localBlockData) {	
				//blockListCheckbox.prop('checked', localBlockData);
				if (localBlockData=='block') {
					blockListRadio[0].checked = true;
				} else {
					blockListRadio[1].checked = true;
				}
			} else {
				//blockListCheckbox.prop('checked', true);
				blockListRadio[0].checked = true;
				saveChanges();
			}
		});
	} catch (error) {
		//blockListCheckbox.prop('checked', true);
		blockListRadio[0].checked = true;
		saveChanges();
		
	}

	// See if the checkbox was checked the last time and check the checkbox accordingly.
	try {
		chrome.storage.sync.get('on', function(fetched) {
			var onCheck = fetched.on;
			if (onCheck) {
				onCheckbox.prop('checked', true);
				//setEnabledFormElements(true);
			} else {
				onCheckbox.prop('checked', false);
				//setEnabledFormElements(false);
			}
		});
	} catch (error) {
		onCheckbox.prop('checked', false);
	}
	
	// See if the user specified a time and put that time in the textfield accordingly.
	try {
		chrome.storage.sync.get('time', function(fetched) {
			var localTimeData = fetched.time;
			if(localTimeData) {	
				timeTextfield.val(localTimeData);
			}
		});
	} catch (error) {
		timeTextfield.val("");
	}
	
	// See what sites the user had listed and retrieve them.
	try {
		chrome.storage.sync.get('websites', function(fetched) {
			var localWebsiteData = fetched.websites;
			if(localWebsiteData) {
				websites = localWebsiteData;
				displayWebsites();
			}
		});
	} catch(error) {
		// Nothing really needs to go here.
	}
	
	
	// See if an alarm is running
	try {
		chrome.storage.sync.get('timing', function(fetched) {
			var isTiming = fetched.timing;
			if (isTiming) {
				setEnabledFormElements(false);
				//setEnabledFormElements(true);
				setUpDisplayTimeAlarm();
			} else {
				setEnabledFormElements(true);
				//setEnabledFormElements(false);
			}
			timing = isTiming;
		});
	} catch (error) {
		timing = false;
	}
	
	// See if the user specified a url and put that url in the textfield.
	try {
		chrome.storage.sync.get('url', function(fetched) {
			var localURLData = fetched.url;
			if(localURLData) {	
				urlTextfield.val(localURLData);
			}
		});
	} catch (error) {
		urlTextfield.val("");
	}
	
	// See if the user specified a theme and set that theme.
	try {
		chrome.storage.sync.get('theme', function(fetched) {
			var localThemeData = fetched.theme;
			if(localThemeData) {	
				themeSelectField.val(localThemeData);
				changeTheme();
			} else {
				themeSelectField.val("0");
				saveChanges();
			}
		});
	} catch (error) {
		themeSelectField.val("0");
		
		saveChanges();
		
	}
	
}

// Change the current theme.
function changeTheme() {
	var themeNumber = parseInt(themeSelectField.val());

	if (themeNumber == 9 || themeNumber == 10) {
		$('b').css('color', 'black');
		$('td').css('border-top', '1px solid black');
	} else {
		$('b').css('color', 'white');
		$('td').css('border-top', '1px solid white');
	}

	$(document.body).css('background-image', 'url(images/background_images/background' + themeNumber + '.png)');	
}


// Establish listener functions for form elements.
function establishListeners() {

	// (themeSelectField) Detect if the theme select has changed value.
	themeSelectField.change(function () {
		changeTheme();
		saveChanges();
	});


	// Add listeners to detect when items in storage have changed.
	function addStorageListeners() {

		var type = "sync";

		// Detect when something changed.
		chrome.storage.onChanged.addListener(function(changes, namespace) {
			if (changes.on) {
				on = changes.on.newValue;
				if (on) {
					onCheckbox.prop('checked', true);
				} else {
					setIconOn(false);
					onCheckbox.prop('checked', false);
				}
			}
			
			if (changes.websites) {
				websites = changes.websites.newValue;
			}
			
			if (changes.time) {
				time = changes.time.newValue;
			}
			if (changes.timing) {
				timing = changes.timing.newValue;
				if (timing) {
					setEnabledFormElements(false);
					setUpDisplayTimeAlarm();
				} else {
					setEnabledFormElements(true);
					removeDisplayTimeAlarm();
				}
			}
			
		});
		
	}
	
	addStorageListeners();
	
	// (onCheckbox) Turn the extension on or off, enable/disable form elements, and save data.
	onCheckbox.click(function() {
		var checked = onCheckbox.prop('checked');
		setIconOn(checked);	
		saveChanges();
		
		var d = new Date();
		
		/*
		var options;
		if (checked) {
			options = {
				type: "basic",
				title: "Procrastinot",
				message: "Procrastinot is now on!",
				iconUrl: chrome.extension.getURL(iconOnPath)
			}
		} else {
			options = {
				type: "basic",
				title: "Procrastinot",
				message: "Procrastinot is now off.",
				iconUrl: chrome.extension.getURL(iconOffPath)
			}
		}
		
		chrome.notifications.create("focusing" + parseInt(d.getTime()), options, function (notificationID) {
			// Works!
		});
		*/
		
	});
	
	
	// (blockListCheckbox) Set if you want the list to be the block or allow list.
	blockListRadio.click(function() {
		saveChanges();
	});
	
	// (timeTextfield) Don't let anyone exceed a maximum amount of minutes.
	timeTextfield.keydown(function(event) {
	
		if (event.keyCode == 16) {
			shiftDown = true;
		}
		
		if (shiftDown) {
			event.preventDefault();
			return;
		}
	
		if (!((event.keyCode >= 48 && event.keyCode <= 57) || 
			(event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 
			|| event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) && isNaN(String.fromCharCode(event.keyCode))) {
			event.preventDefault();
			return;
		}
		
		var hasNumeric = false;
		for (var i = 1; i < 10; i++) {
			if (timeTextfield.val().indexOf(parseInt(i)) != -1) {
				hasNumeric = true;
			} else {
				hasNumeric = hasNumeric || false;
			}
		}
		
		if (!hasNumeric && event.keyCode == 48) {
			event.preventDefault();
			return;
		}
	
		if (event.keyCode != 8 && event.keyCode != 46 && event.keyCode != 9) {
			if (parseInt(timeTextfield.val() + String.fromCharCode(event.keyCode)) > parseInt(maxMin)) { // don't let anyone exceed the max amount of minutes in a day.
				timeTextfield.val(maxMin);
				event.preventDefault();
			}
		}
		
	});

	// (timeTextfield) Allow numbers only and save data. Some code obtained from stackoverflow.
	timeTextfield.keyup(function(event) {
	
        // Allow: backspace, delete, tab, escape
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || 
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey == true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39) ||
			// Allow: numbers
			(event.keyCode >= 48 && event.keyCode <= 57) || 
			(event.keyCode >= 96 && event.keyCode <= 105)) {
				 saveChanges();
        }
		
		if (event.keyCode == 16) {
			shiftDown = false;
		}
		
    });
	
	timeTextfield.bind('paste', function(event) {
		event.preventDefault();
	});
	
	
	// (urlTextfield) Save changes.
	urlTextfield.keydown(function (event) {
		if ((event.keyCode != 46 && event.keyCode != 8 && event.keyCode != 9) && urlTextfield.val().length == 63) {
			event.preventDefault();
		}
	});
	
	// (urlTextfield) Save changes.
	urlTextfield.keyup(function (event) {
		if (event.keyCode == 13) {
			addWebsiteButtonFunction();
		}
		saveChanges();
	});
	
	// Add website.
	function performAddition(input) {
		var domain = getDomainName(input);
			if (domain  && domain != "chrome.google.com") {
				var addedWebsite = addWebsite(domain);
				
				// If successful, show dialog to confirm, otherwise show error.
				if (addedWebsite) {
					// Show confirmation.
					/*
					var options = {
						type: "basic",
						title: "Success!",
						message: 'The website "' + domain + '" was added!',
						iconUrl: chrome.extension.getURL(iconOnPath)
					};
					
					var d = new Date();
					
					chrome.notifications.create("added" + parseInt(d.getTime()), options, function (notificationID) {
						// Works!
					});
					*/
					
					urlTextfield.val("");
					saveChanges();
				} else {
					// Show error.
					var options = {
						type: "basic",
						title: "Failure",
						message: 'The website "' + domain + '" could not be added. Remember, you cannot add duplicate websites.',
						iconUrl: chrome.extension.getURL(iconOnPath)
					};
					
					var d = new Date();
					
					chrome.notifications.create("failure" + parseInt(d.getTime()), options, function (notificationID) {
						// Works!
					});
				}
			} else {
				var options = {
						type: "basic",
						title: "Failure",
						message: "This either is not a website or is chrome.google.com. You cannot block these.",
						iconUrl: chrome.extension.getURL(iconOnPath)
					};
					
					var d = new Date();
					
					chrome.notifications.create("failure" + parseInt(d.getTime()), options, function (notificationID) {
						// Works!
					});
			}
	}
	
	// Add website button function.
	var addWebsiteButtonFunction = function() {
		// Show something for input and get it.
		var input = urlTextfield.val();
		
		// Code obtained from outside source.
		function isUrl(s) {
			var myVariable = s;
			if(/^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(myVariable)) {
				return true;
			} 
			return false;
		}
		
		if (input) {
			performAddition(input);
		} else {
		
			chrome.tabs.getSelected(null,function(tab) {
				var tablink = tab.url;
				
				if (tablink) {
					performAddition(tablink);
				}
			});
		
			
		}
	}

	// (addWebsiteButton) Add a website if not already added and save local data.
	addWebsiteButton.click(addWebsiteButtonFunction);
	
	// (clearWebsitseButton) Clear all websites and save local data.
	clearWebsitesButton.click(function() {
		clearWebsites();
		websites = new Array();
		saveChanges();
	});
	
	// (startTimerButton) Start focus timer.
	startTimerButton.click(function() {
		var minutes = parseInt(timeTextfield.val());
		
		if (!(minutes)) {
			return;
		}
		
		if (minutes > 180) {
			minutes = 180;
		}
		
		if (minutes > 0) {
			timing = true;
			setEnabledFormElements(false);
			
			if (!(onCheckbox.prop('checked'))) {
				onCheckbox.prop('checked', true);
				setIconOn(true);
			}
			
			saveChanges();			
			
		} else {
			window.alert('Please enter a valid amount of minutes.');
		}
	});
	
	
}

// Destroy currently visible websites.
function clearWebsites() {
	for (var i = 0; i < websites.length; i++) {
		$('#website' + i).remove();
	}
}

// Show websites in scrollable table.
function displayWebsites() {
	for (var i = 0; i < websites.length; i++) {
		// Make a row for every site.
		var buttonString = '<input value="Remove" type="button" id="button' + i + '" class="myButton">';
		$('<tr id="website' + i + '"><td><b>' + websites[i] + '</b></td><td>' + buttonString + '</td></tr>').appendTo('#websiteTable');
		
		// Create button listener.
		createButtonListener(i);
	}
	
	changeTheme();
}

// Create the button listener for a table row.
function createButtonListener(websiteNumber) {
	$('#button' + websiteNumber).click( function() {
		clearWebsites();
		removeWebsite(websiteNumber);		
		displayWebsites();
	});
}




// Save user preferences to local storage.
function saveChanges() {

	var on = onCheckbox.prop('checked');
	var time = timeTextfield.val();
	var url = urlTextfield.val();
	var theme = themeSelectField.val();
	var toBlock = $('input:radio[name=block]:checked').val();
			
	chrome.storage.sync.set({
		'on':on,
		'time':time,
		'websites':websites,
		'timing':timing,
		'url': url,
		'theme': theme,
		'block': toBlock
	});
	
	
}

// Adds a website if it is not already added and updates the table.
// Return true if successful and return false if not.
function addWebsite(websiteName) { // Parameter is a string.
	if (websites.indexOf(websiteName) >= 0 || websiteName.indexOf('.') == -1 || websiteName.length - websiteName.indexOf('.') <= 2) {
		return false;
	}

	clearWebsites();
	
	var len = websites.length;
	websites.splice(0, 0, websiteName);
	websites.sort();
	saveChanges();
	
	displayWebsites();
	
	if (timing) {
		setEnabledFormElements(false);
	} else {
		setEnabledFormElements(true);
	}
	
	return true;
}

// Removes a website if it is registered and updates the table.
// Return true if successful and return false if not.
function removeWebsite(websiteNumber) { // Parameter is an integer.
	var element = websites[websiteNumber];
	if (element) {
		websites.splice(websiteNumber, 1);
		saveChanges();
		return true;
	}
	
	return false;
}









// Set up timer for displaying time.
function setUpDisplayTimeAlarm() {
	getTimeLeft();
	displayTimeTimer = setInterval(getTimeLeft, 200);
}

// Get rid of unnecessary timer.
function removeDisplayTimeAlarm() {
	$('#time').remove();
	try {
		clearInterval(displayTimeTimer);
	} catch(error) {
	
	}
}

// Get amount of time left in focus timer. 
function getTimeLeft() {
	try {
		chrome.alarms.get('focusAlarm', function (alarm) { // Parameter is an Alarm object.
		
		
			var scheduledTime  = alarm.scheduledTime;
			var currentTime = (new Date()).getTime();
			var timeRemainingMilliseconds = scheduledTime - currentTime;
			
			
			var numberMinutes = Math.floor((((Math.round(timeRemainingMilliseconds/1000) % 31536000) % 86400) % 3600) / 60);
			var numberSeconds = (((Math.round(timeRemainingMilliseconds/1000) % 31536000) % 86400) % 3600) % 60;
			
			$('#time').remove();
			if (numberMinutes == 0) {
				if (numberSeconds < 10) {
					$('<b id="time"><br />' + numberSeconds + 'sec</b>').appendTo('#focusTimeText');
				} else {
					$('<b id="time"><br />' + numberSeconds + 'sec</b>').appendTo('#focusTimeText');
				}
			} else {
				if (numberSeconds < 10) {
					$('<b id="time"><br />' + numberMinutes+ 'min ' + numberSeconds + 'sec</b>').appendTo('#focusTimeText');
				} else {
					$('<b id="time"><br />' + numberMinutes+ 'min ' + numberSeconds + 'sec</b>').appendTo('#focusTimeText');
				}

			}
			
			
		});
	} catch (error) {
		
	}
}






