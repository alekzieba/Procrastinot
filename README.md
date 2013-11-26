Procrastinot
============

This is a Google Chrome extension that helps you get things done by blocking distracting websites.

Made by Alek Zieba.

============

Can't stay focused on that essay due tomorrow?  Can't get your work done without checking social
media every few minutes?  Not to worry, Procrastinot is here for you!

Procrastinot is an extension for Google Chrome that prevents you from visiting distracting websites.
Here's how it works: you give it a list of websites, you tell the extension to either block those
websites or only allow those websites, and boom, you're focused!  Whenever you try to access one
of these distracting websites, Procrastinot will bring you to a redirect page with a random
motivational quote from its database to get you back to work!

It also features a "Focus Timer", where you can set a certain amount of time for you to focus.
During this time, Procrastinot will prevent you from making distracting changes to your lists.

============

To use the packed extension, go to the "Extensions" settings in Google Chrome and make sure
that the "Developer mode" checkbox is checked.  Then, download the source code for this
project and decompress it to obtain the source files as seen in this GitHub page.

Then, click "Load unpacked extension...", click on the "source" folder in this project,
click "OK" or "Select", and Procrastinot will be installed on your computer!

For some reason, Google has recently differed the ways that packaged and non-packaged
Chrome extensions run, which broke the timer with the packed extension.  Until this is
fixed, we'll have to install this extension via developer mode.

============

The extension is managed through a drop-down area from a button next to the omnibox.  The drop-down area
is "popup.html".

If someone is caught procrastinating, they are brought to "redirect.html".

In order for the Focus Timer and the website checker to be able to run, "background.html" always runs.

Each of the HTML files' respective scripts end in "_script.js".

The extension's permissions, version, description, etc. are managed in "manifest.json".

============

Happy reading!
