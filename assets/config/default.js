function main() {
    let link = new URL(url);
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");
    switch (link.hostname) {
        case "www.novelupdates.com":
            var paths = link.pathname.split("/");
            if (paths.length > 1 && paths[1] == "series") {
                return {page_type: "toc", parser: "chaps_nu"};
            }
    }
// Default to all links
    return {page_type: "toc", parser: "chaps_all_links"};
}

function toc_parser() {
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");
    let chap_popup = dom.querySelector("#my_popupreading");
    if (chap_popup == null) {
        return []
    }
    let chap_lis = chap_popup.querySelectorAll("a");
    let chaps = [];
    chap_lis.forEach((element) => {
        if (element.href.includes("extnu")) {
            chaps.unshift({
                url_title: element.innerText,
                url: helpers["link_fixer"](element.href, url),
            });
        }
    });
    let tit = dom.querySelector(".seriestitlenu").innerText;
    let desc = dom.querySelector("#editdescription").innerHTML;
    let auth = dom.querySelector("#authtag").innerText;
    let img = dom.querySelector(".serieseditimg > img");
    if (img == null){
        img = dom.querySelector(".seriesimg > img");
    }
    return {"chaps":chaps,
        meta:{title:tit, description: desc, author: auth, cover: img.src, publisher: "Novel Update"}
    };
}

function chap_name_search(){
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");
    let ancs = dom.querySelectorAll("a");
    let chaps = []
    ancs.forEach((element) => {
        if(RegExp(/chap|part/i).test(element.innerText)){
            chaps.push({
                url_title: element.innerText,
                url: helpers["link_fixer"](element.href, url),
            });
        }
    });
    return {"chaps":chaps,
        meta:{}
    };
}

function chap_all_links(){
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");
    let ancs = dom.querySelectorAll("a");
    let chaps = []
    ancs.forEach((element) => {
        chaps.push({
            url_title: element.innerText,
            url: helpers["link_fixer"](element.href, url),
        });
    });
    return {"chaps":chaps,
        meta:{}
    };
}

function readability(){
    let url = new URL(url);
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");

    // Generic parser
    return {chap_type: "chap", parser:"chaps_readability"};
}


async function readability_ex(){
    let parser = new DOMParser();
    let dom = parser.parseFromString(source, "text/html");

    let new_link = null;
    let subchaps = [];

    // Wordpress content
    let main_cont = dom.querySelector(".entry-content")
    if(helpers["readerable"](dom, {"minContentLength":1000})){
        console.log("Readable");
        let out = helpers["readability"](dom);
        return {title: out.title, html: out.content};
    } else if(main_cont != null){
        console.log("Checking for intro page/subchapt");
        let ancs = main_cont.querySelectorAll("a");
        ancs.forEach((element) => {
            if(RegExp(/click here to read|read here|continue reading/i).test(element.innerText)){
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
        return {title: out.title, html: out.content};
    } else if (subchaps.length > 0) {
        let html = "";
        for(let subc in subchaps){
            console.log(subchaps[subc]);
            let cres = await fetch(subchaps[subc]);
            let c_txt = await cres.text();
            let cdom = parser.parseFromString(c_txt, "text/html");
            let out = helpers["readability"](cdom);
            html += "<h1>"+out.title+"</h1>"+ out.content
        }
        return {title: title, html: html};
    }
    let out = helpers["readability"](dom);
    return {title: out.title, html: out.content};
}

async function raw_chap(){
    return {title: title, html: source}
}
