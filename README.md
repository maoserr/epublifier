# Epublifier #

Converts e-novels hosted on websites into Epub files.

## Features ##
- Support novels with many chapters (tested up to 300 chapters)
- Downloads and embeds images
- Can selectively parse chapters by using shift-select
- Automatically catches main content with readability.js
- Cover image, author, title, description are auto-parsed from some sites.
  - Novel Updates
- Configurable parsers for table of contents and chapters

## How to Use ##
- Navigate to a table of content page
  - Example: https://www.novelupdates.com/series/<series>
- Open popup, it should automatically try to detect the page data
- Click `Load Chapter List`
- Select some chapters (or all of them)
- Click `Extract Chapters`, if all is well, it should say `Parsed` if parser worked
- Click `Compile Epub` to generate the ePub as a download

## Building ##
Build Environmen 
- Windows 10
- NPM version 8.1.2

Build Steps
- Install NPM
- Run `npm install` in base directory 
- Run `npm run build_ff` for Firefox
- Run `npm run build` for Chrome