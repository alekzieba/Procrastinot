// -------------------------------
// Procrastinate Extension for Chrome: redirect_script.js
// This is the script for the REDIRECT PAGE of the extension.
// Written 8/16/13 by Alek Zieba.
// --
// All functions return VOID unless otherwise stated.
// -------------------------------

// Array of motivational quotes and authors. Array of arrays.
var quotes = [
["If you're going through hell, keep going.", "Winston Churchill"],
["You are never too old to set another goal or to dream a new dream.", "C.S. Lewis"],
["After the storm comes a calm.", "Matthew Henry"],
["Be miserable. Or motivate yourself. Whatever has to be done, it's always your choice.", "Wayne Dyer"],
["Expect problems and eat them for breakfast.", "Alfred A. Montapert"],
["Do you want to know who you are? Don't ask. Act! Action will delineate and define you.", "Thomas Jefferson"],
["If you can dream it, you can do it.", "Walt Disney"],
["Even if you fall on your face, you're still moving forward.", "Victor Kiam"],
["Either you run the day or the day runs you.", "Jim Rohn"],
["Whether you think you can or think you can't, you're right.", "Henry Ford"],
["The best revenge is massive success.", "Frank Sinatra"],
["Obstacles are those frightful things you see when you take your eyes off the goal.", "Henry Ford"],
["The only person you are destined to become is the person you decide to be.", "Ralph Waldo Emerson"],
["I would rather die of passion than of boredom.", "Vincent van Gogh"],
["It is never too late to be what you might have been.", "George Eliot"],
["You become what you believe.", "Oprah Winfrey"],
["There are no traffic jams along the extra mile.", "Roger Staubach"],
["Dream big and dare to fail.", "Norman Vaughan"],
["Do what you can, where you are, with what you have.", "Teddy Roosevelt"],
["Happiness is not something readymade. It comes from your own actions.", "Dalai Lama"],
["The way to get started is to quit talking and begin doing.", "Walt Disney"],
["Build your dreams, or someone else will hire you to build theirs.", "Farrah Gray"],
["Start where you are. Use what you have. Do what you can.", "Arthur Ashe"],
["You may be disappointed if you fail, but you are doomed if you don't try.", "Beverly Sills"],
["The question isn't who is going to let me; it's who is going to stop me.", "Ayn Rand"],
["It's not the years in your life that count. It's the life in your years.", "Abraham Lincoln"],
["Go confidently in the direction of your dreams. Live the life you have imagined.", "Henry David Thoreau"],
["The only thing that stands between you and your dream is the will to try and the belief that it is actually possible.", "Joel Brown"],
["We are what we repeatedly do. Excellence, therefore, is not an act but a habit.", "Aristotle"],
["The only way of finding the limits of the possible is by going beyond them into the impossible.", "Arthur C. Clarke"],
["Strong lives are motivated by dynamic purposes.", "Kenneth Hildebrand"],
["An oak is not felled at one blow.", "Spanish Proverb"],
["Well begun is half done.", "Greek Proverb"],
["Do not wait to strike till the iron is hot; but make it hot by striking.", "William B. Sprague"],
["Constant dripping hollows out a stone.", "Lucretius"]
];
var quote = 0;
var author = 1;

// Start execution.
$(document).ready( function() {
	
	
	
	// Choose and display a random motivational quote.
	displayQuote();
	
	// Get local data and set things accordingly.
	getLocalData();
	
	// Fade in the body of the file.
	// $(document.body).hide().fadeIn(1000);
	
});

// Choose and display a random motivational quote.
function displayQuote() {

	var len = quotes.length;
	var quoteNumber =  Math.floor(Math.random() * (len));
	
	var quoteElement = '<b id="quote">"' + quotes[quoteNumber][quote] + '"</b><br /><br /><b class="alignRight" id="author"> -' + quotes[quoteNumber][author] + '</b><br /><br /><br />';
	
	$(quoteElement).prependTo('#quoteSpace');
	
}

// Change the background.
function changeBackground(themeData) { // Parameter is an integer.
		if (themeData == 9 || themeData == 10) {
			$('b').css('color', 'black');
			$('td').css('border-top', '1px solid black');
		} else {
			$('b').css('color', 'white');
			$('td').css('border-top', '1px solid white');
		}
		$(document.body).css('background-image', 'url(images/background_images/background' + themeData + '.png)');
}

// Get local data.
function getLocalData() {
	// See if the user specified a theme and set that theme.
	try {
		chrome.storage.sync.get('theme', function(fetched) {
			var localThemeData = fetched.theme;
			if(localThemeData) {
				changeBackground(localThemeData);
			}
			
			
			
		});
	} catch (error) {
	
	}
}

// Detect when something changes.
chrome.storage.onChanged.addListener(function(changes, namespace) {
	if (changes.theme) {
		changeBackground(changes.theme.newValue);
	}
});