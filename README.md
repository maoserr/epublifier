# Epublifier #

Fans of eReaders and Kindle can use this tool to generate eReader/Kindle compatible files from websites to read later.

An extremely customizable tool that allows you to extract a list of html pages from a table of content page and compile them into an ePub book to be imported into your eReader of choice.

For advanced users who can write javascript, you can add additional parser definition to customize parsing of any site.

## Features ##
- Support novels with many chapters (tested up to 300 chapters)
- Downloads and embeds images
- Can selectively parse chapters by using shift-select
- Automatically catches main content with readability.js
- Cover image, author, title, description are auto-parsed from some sites.
  - Novel Updates
- Configurable parsers for table of contents and chapters

## How to Use ##
- Install the extension
  - Firefox: https://addons.mozilla.org/en-US/firefox/addon/epublifier/
  - Chrome: https://chrome.google.com/webstore/detail/epublifier/eopjnahefjhnhfanplcjpbbdkpbagikk
- Navigate to a table of content page
  - Example: `https://www.novelupdates.com/series/<series>`
  - 🛈 (*For novelupdates*) Click on the ☰ menu button (Show all chapters) above the chapter list
- Click Epublifier's icon on your browser's extension bar, which will open a popup. It will automatically try to load the series' metadata.
- Click `Load Chapter List`, which will create a new tab
- Select some chapters (or all of them)
  - 🛈 You may use Shift+Click to select a range of chapters to include or delete.
- Click `Extract Chapters`, if all is well, it should say `Parsed` if parser worked
- Click `Compile Epub` to generate the ePub as a download

## Advanced User Configurations ##
**Warning: Advanced configuration requires javascript knowledge**

### Overview ###
There are four configurations for advanced users:
- Table of Content Auto detector - Changes which TOC parser to use depending on page source and URL
- Table of Content parsers - Actually parses HTML into list of chapter URLs or chapter htmls
- Chapter Type Auto Detector - Detects what kindof chapter parser to use depending on page source and URL
- Chapter Parser - Parses a chapter HTML text into text only HTML content

### Configuring a parser ###
You can either create a new YAML parser definition or modify the existing main definition.

## Building ##
Build Environment
- Windows 10
- NPM version 8.1.2

Build Steps
- Install NPM
- Run `npm install` in base directory 
- Run `npm run build_ff` for Firefox
- Run `npm run build` for Chrome

CI/CD

## Acknowledgements ##
1. [jEpub](https://lelinhtinh.github.io/jEpub/)
