module.exports = function URLMethods()
{
	this.getDomainName = getDomainName;
	this.testSlash = testSlash;
	this.slashIsValid = slashIsValid;
}

// Get the domain name of a URL.
// Returns a string if works, null if it doesn't.
function getDomainName(URL) { // Parameter is a string.

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


// Check to see if you can get a domain name from the given URL.
// Returns string if successful and null if not.
function testSlash(URL, indexOfSlash) {
	if (slashIsValid(indexOfSlash)) {
		URL = URL.substr(0, indexOfSlash);
		return URL;
	} else if (indexOfSlash == -1) {
		return URL;
	}
	return null;
}




// Check to see if the slash in a URL is valid.
// Returns boolean.
function slashIsValid(slash) { // Parameter is an integer.
	if (slash && (slash > 4)) {
		return true;
	}
	return false;
} 
