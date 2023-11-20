const main_def = {
    detector: {
        func: main_parser,
        inputs: {}
    },
    links: {
        'Novel Updates': {
            func: nu_toc_parser,
            inputs: {}
        },
        'Chapter Links': {
            func: chap_name_search,
            inputs: {
                'Link Regex': {type: 'text', default: '^c.*'},
                'Query Selector': {type: 'text', default: 'a'}
            }
        },
    },
    text: {
        'Readability_Ex': {
            func: readability_ex,
            inputs: {}
        },
        'Readability': {
            func: readability,
            inputs: {}
        },
    }
}

/**
 * Gets metadata from Novel updates
 * @param {string}url
 * @param {HTMLElement}dom
 * @returns {{
 * author: string,
 * description: string,
 * publisher: string,
 * title: string}}
 */
function meta_nu(dom, url) {
    let tit = dom.querySelector(".seriestitlenu").innerText;
    let desc = dom.querySelector("#editdescription").innerHTML;
    let auth = dom.querySelector("#authtag").innerText;
    let img = dom.querySelector(".serieseditimg > img");
    if (img == null) {
        img = dom.querySelector(".seriesimg > img");
    }
    return {
        title: tit,
        description: desc,
        author: auth,
        cover: img.src,
        publisher: "Novel Update"
    }
}

/**
 * Gets metadata from html metadata
 * @param {string}url
 * @param {HTMLElement}dom
 * @returns {{
 * author: string,
 * description: string,
 * publisher: string,
 * title: string}}
 */
function meta_page(dom, url) {
    return {
        title: dom.title ?? "No Title",
        description: dom.querySelector('meta[name="description"]')?.content,
        author: "N/A",
        publisher: new URL(url).hostname
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
                return {
                    message: 'Detected novel update.',
                    parser_opt: {type: 'links', parser: 'Novel Updates'},
                    meta: meta_nu(dom, url)
                }
            }
            return {failed_message: "Please load specific series before running."}
        case "www.wuxiaworld.com":
            if (paths.length > 3 && paths[1] === 'novel') {
                return {
                    message: 'Detected Wuxia World.',
                    webtype: 'spa',
                    meta: meta_page(dom, url),
                    parser_opt: {type: 'text', parser: 'Readability'},
                    add_opt: {
                        next_sel: '.MuiButton-root:nth-child(2)',
                        title_sel: '.font-set-b18', scroll_end: true
                    }
                }
            }
            return {failed_message: "Please load first chapter of novel"}
        case "www.royalroad.com":
            return {
                message: 'Detected Royalroad.',
                meta: {
                    title: dom.title ?? "No Title",
                    description: dom.querySelector('meta[name="description"]')?.content,
                    author: dom.querySelector('span > .font-white').innerText ?? "No author",
                    publisher: new URL(url).hostname,
                    cover: dom.querySelector('.fic-header img')?.src,
                },
                parser_opt: {
                    type: 'links', parser: 'Chapter Links',
                    parser_inputs: {
                        'Query Selector': '.chapter-row > td:nth-child(1) > a',
                        'Link Regex': '.*'
                    }
                }
            }
        case "news.ycombinator.com":
            // Just for some testing
            if (link.pathname === '/' || (paths[1].startsWith("?p="))) {
                return {
                    message: 'Detected YCombinator.',
                    meta: meta_page(dom, url),
                    parser_opt: {
                        type: 'links', parser: 'Chapter Links',
                        parser_inputs: {
                            'Query Selector': '.titleline > a',
                            'Link Regex': '.*'
                        }
                    }
                }
            }
            return {failed_message: "Please only load on front page(s)."}
        case "www.reddit.com":
            // Just for some testing
            return {
                message: 'Detected Reddit.',
                meta: meta_page(dom, url),
                parser_opt: {
                    type: 'links', parser: 'Chapter Links',
                    parser_inputs: {
                        'Query Selector': '.SQnoC3ObvgnGjWt90zD9Z',
                        'Link Regex': '.*'
                    }
                }
            }
        default:
            return {failed_message: "No automatic parser available for: " + link.hostname}
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
    let chaps = [];

    let chap_popup = dom.querySelector("#my_popupreading");
    let parser_msg = "Please expand all chapters!"
    if (chap_popup != null) {
        let chap_lis = chap_popup.querySelectorAll("a");
        chap_lis.forEach((element) => {
            if (element.href.includes("extnu")) {
                chaps.unshift({
                    url: element.href,
                    title: element.innerText.trim()
                });
            }
        });
        if (chaps.length > 0) {
            parser_msg = 'Page parsed as Novel Update Series (' + chaps.length + ' chapters)'
        }
    }
    return {
        chaps: chaps, message: parser_msg
    };
}

/**
 * Search for chapter by link names
 * @param {{'Query Selector':string,'Link Regex':string}} inputs
 * @param {string} url
 * @param {string} source
 * @param {{}} helpers
 * @returns {{chaps: *[], message: string}}
 */
function chap_name_search(inputs,
                          url, source, helpers) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");
    let ancs = dom.querySelectorAll(inputs['Query Selector']);
    let chaps = []
    const chap_reg = new RegExp(inputs['Link Regex'], 'i')
    ancs.forEach((element) => {
        if (chap_reg.test(element.innerText)) {
            chaps.push({
                url: element.href,
                title: element.innerText
            });
        }
    });
    return {
        chaps: chaps,
        message: 'Parsing links with prefix chapter (' + chaps.length + ' chapters)'
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
        title: out.title,
        html: out.content,
        message: "Parsed simple chapter"
    };
}


/**
 * Parse using extended readability logic
 * @param inputs
 * @param url
 * @param source
 * @param helpers
 * @returns {Promise<{html: string, title: string, message: string}>}
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
            title: out.title,
            html: out.content,
            message: "Parsed normal chapter.",
        };
    } else if (main_cont != null) {
        console.log("Checking for intro page/subchapt");
        let ancs = main_cont.querySelectorAll("a");
        ancs.forEach((element) => {
            if (RegExp(/click here to read|read here|continue reading/i).test(element.innerText)) {
                console.log("Intro page found");
                new_link = element.href;
            } else if (RegExp(/^chapter|^part/i).test(element.innerText)) {
                console.log("Subchapters found");
                subchaps.push(element.href)
            }
        });
    }
    if (new_link != null) {
        let res = await fetch(new_link);
        let r_txt = await res.text();
        dom = parser.parseFromString(r_txt, "text/html");
        let out = helpers["readability"](dom);
        return {
            title: out.title,
            html: out.content,
            message: "Parsed redirected chapter",
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
            title: title,
            html: html,
            message: "Parsed sub chapters",
        };
    }
    let out = helpers["readability"](dom);
    return {
        title: out.title,
        html: out.content,
        message: "Parsed short chapter",
    };
}

