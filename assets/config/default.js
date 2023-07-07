/**
 * Initialization function
 * @returns
 */
function load() {
    console.debug("Parser loaded.")
    return {
        init_parsers: {
            'Auto': {
                func: main_parser, inputs: {}
            },
            'Novel Updates': {
                func: nu_toc_parser, inputs: {}
            },
            'Chapter Links': {
                func: chap_name_search, inputs: {
                    'Link Regex': {type: 'text', default: '^c.*'},
                    'Query Selector': {type: 'text', default: 'a'}
                }
            },
        },
        chap_parsers: {
            'Auto': {func: readability_ex, inputs: {}},
            'Simple': {func: readability, inputs: {}},
        }
    }
}

/**
 * Gets default value for a given parser
 * @param parser_def
 * @returns {{[p: string]: undefined}}
 */
function get_default_vals(parser_def) {
    return Object.fromEntries(Object.entries(parser_def.inputs)
        .map(([k, v]) => [k, v.default]))
}

/**
 * Gets metadata from html metadata
 * @param url
 * @param dom
 * @returns {{author: string, description: *, publisher: string, title: string}}
 */
function page_meta(url, dom) {
    return {
        title: dom.title ?? "No Title", description: dom.querySelector('meta[name="description"]')?.content,
        author: "N/A", publisher: new URL(url).hostname
    }
}

/**
 * Auto detect function given url and source
 * @param inputs User inputs (if any)
 * @param url Page URL
 * @param source Page source
 * @param helpers Helpers
 * @returns
 */
function main_parser(inputs, url, source, helpers) {
    console.debug("Running main")
    let link = new URL(url);
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");
    let paths = link.pathname.split("/")
    switch (link.hostname) {
        case "www.novelupdates.com":
            if (paths.length > 1 && paths[1] === "series") {
                return nu_toc_parser(inputs, url, source, helpers)
            }
            break;
        default:
            return chap_name_search(
                get_default_vals(main_def.toc_parsers["Chapter Links"]),
                url, source, helpers)
    }
}


/**
 * Parse novel update series
 * @param inputs Inputs
 * @param url Series URL
 * @param source Source text
 * @param helpers Help functions
 * @returns
 */
function nu_toc_parser(inputs, url, source, helpers) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");
    let tit = dom.querySelector(".seriestitlenu").innerText;
    let desc = dom.querySelector("#editdescription").innerHTML;
    let auth = dom.querySelector("#authtag").innerText;
    let img = dom.querySelector(".serieseditimg > img");
    if (img == null) {
        img = dom.querySelector(".seriesimg > img");
    }
    let chaps = [];

    let chap_popup = dom.querySelector("#my_popupreading");
    let parser_msg = "Please expand all chapters!"
    if (chap_popup != null) {
        let chap_lis = chap_popup.querySelectorAll("a");
        chap_lis.forEach((element) => {
            if (element.href.includes("extnu")) {
                chaps.unshift({
                    title: element.innerText.trim(),
                    url: helpers["link_fixer"](element.href, url),
                    parser: 'Default'
                });
            }
        });
        if (chaps.length > 0) parser_msg = 'Page parsed as Novel Update Series (' + chaps.length + ' chapters)'
    }
    return {
        chaps: chaps, message: parser_msg, meta: {
            title: tit, description: desc, author: auth, cover: img.src, publisher: "Novel Update"
        }
    };
}

/**
 * Search for chapter by link names
 * @param inputs
 * @param url
 * @param source
 * @param helpers
 * @returns {{meta: {title: string}, chaps: *[], message: string}}
 */
function chap_name_search(inputs, url, source, helpers) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");
    let ancs = dom.querySelectorAll(inputs['Query Selector']);
    let chaps = []
    const chap_reg = new RegExp(inputs['Link Regex'], 'i')
    ancs.forEach((element) => {
        if (chap_reg.test(element.innerText)) {
            chaps.push({
                title: element.innerText, url: helpers["link_fixer"](element.href, url), parser: 'Default'
            });
        }
    });
    return {
        chaps: chaps, message: 'Parsing links with prefix chapter (' + chaps.length + ' chapters)',
        meta: page_meta(url, dom)
    };
}

/**
 * Parse using readability
 * @param inputs
 * @param url
 * @param source
 * @param helpers
 * @returns {{html, title, message: string}}
 */
function readability(inputs, url, source, helpers) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");
    let out = helpers["readability"](dom);
    // Generic parser
    return {
        title: out.title, html: out.content, message: "Parsed simple chapter",
        meta: page_meta(url, dom)
    };
}


/**
 * Parse using extended readability logic
 * @param inputs
 * @param url
 * @param source
 * @param helpers
 * @returns {Promise<{html: string, title: string, message: string}|{html: *, title: *, message: string}>}
 */
async function readability_ex(inputs, url, source, helpers) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");

    let new_link = null;
    let subchaps = [];

    // Wordpress content
    let main_cont = dom.querySelector(".entry-content")
    if (helpers["readerable"](dom, {"minContentLength": 1000})) {
        console.log("Readable");
        let out = helpers["readability"](dom);
        return {
            title: out.title, html: out.content, message: "Parsed normal chapter.",
            meta: page_meta(url, dom)
        };
    } else if (main_cont != null) {
        console.log("Checking for intro page/subchapt");
        let ancs = main_cont.querySelectorAll("a");
        ancs.forEach((element) => {
            if (RegExp(/click here to read|read here|continue reading/i).test(element.innerText)) {
                console.log("Intro page found");
                new_link = helpers["link_fixer"](element.href, url);
            } else if (RegExp(/^chapter|^part/i).test(element.innerText)) {
                console.log("Subchapters found");
                subchaps.push(helpers["link_fixer"](element.href, url))
            }
        });
    }
    if (new_link != null) {
        let res = await fetch(new_link);
        let r_txt = await res.text();
        dom = parser.parseFromString(r_txt, "text/html");
        let out = helpers["readability"](dom);
        return {
            title: out.title, html: out.content, message: "Parsed redirected chapter",
            meta: page_meta(url, dom)
        };
    } else if (subchaps.length > 0) {
        let html = "";
        let title = "";
        for (let subc in subchaps) {
            console.log(subchaps[subc]);
            let cres = await fetch(subchaps[subc]);
            let c_txt = await cres.text();
            let cdom = parser.parseFromString(c_txt, "text/html");
            let out = helpers["readability"](cdom);
            if (title === "") {
                title = out.title + "...(more)"
            }
            html += "<h1>" + out.title + "</h1>" + out.content
        }
        return {
            title: title, html: html, message: "Parsed sub chapters",
            meta: page_meta(url, dom)
        };
    }
    let out = helpers["readability"](dom);
    return {
        title: out.title, html: out.content, message: "Parsed short chapter",
        meta: page_meta(url, dom)
    };
}

