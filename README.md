# Epublifier #
Converts websites into epub.

A tool that allows you to extract a list of html pages from a website and compile them into an ePub book to be imported into your eReader of choice.

For advanced users who can write javascript, you can add additional parser definition to customize parsing of any site.

Check out the [wiki](https://github.com/maoserr/epublifier/wiki) for usage.

Currently supporting following sites:
1. Novel Update
2. Wuxia World
3. Most sites from [awesome-read-the-docs](https://github.com/readthedocs-examples/awesome-read-the-docs)
4. Custom sites with UL/OL elements as table of content, or regex on Link text, or use query selector
5. Custom web app with predefined Title (header) element and Next button (clickable)

## Installation ##
  - Firefox: https://addons.mozilla.org/en-US/firefox/addon/epublifier/
  - Chrome: https://chrome.google.com/webstore/detail/epublifier/eopjnahefjhnhfanplcjpbbdkpbagikk

## Example Usage ##

### Extracting list of pages
![Novel Update](docs/nu.gif?raw=true "List of Pages")

### Tranversing Webapp through next button
![Wuxia World](docs/wuxiaworld.gif?raw=true "Next button")

### Extracting other documentation
![FastAPI](docs/fastapi.gif?raw=true "Documentations")

# Why build a scraper as an extension? instead of command line, calibre plugin, etc...

This is for ad hoc generation of EPub from websites that don't have scrape well using traditional scrapers (think standard request based command line scripts or some other chrome extensions that scrape based on open tabs/window) for some reasons:

1. Usually command line scrapers and other extensions have predefined sites they work for, this one's outside of those sites

2. Or they requires nontrivial configuration and/or code

3. Some sites use javascript to dynamically generates/retrieve the text, in which case you need the browser to run the JS - This was the biggest gap for me.

4. This one runs in the browser, so maybe less likely to be detected and blocked

I also don't intend this scraper to be robust or used in a repeated fashion as a background scheduled job, that's why there's a UI for selecting key elements for scraping. It's meant to be more generalized so that you don't have to have a configuration for a site to still be able to scrape it relatively easily with just some mouse clicks.

If the site you're scraping is already handled by the other programs/extensions, then this wouldn't perform better since the other ones are specifically configured for those sites. Otherwise, this extension gives you the tool to scrape something once or twice without spending too much time coding/configuring.

I don't find myself sticking to the same site a lot, so wrote this.

# Building ##
Build Environment
- Windows 10
- NPM version 8.1.2

Build Steps
- Install NPM
- Run `npm install` in base directory 
- Run `npm run build_ff` for Firefox
- Run `npm run build` for Chrome

CI/CD

# Acknowledgements ##
1. [jEpub](https://lelinhtinh.github.io/jEpub/)
