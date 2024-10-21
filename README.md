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
