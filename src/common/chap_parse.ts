import {Chapter} from "./novel_data";
import {parse_wordpress} from "../chap_parsers/wordpress";

export function chap_parse(chap: Chapter): Chapter {
    let url = new URL(chap.url);
    switch (url.hostname) {
        case "isekailunatic.com":
            return parse_wordpress(chap);
        case "bayabuscotranslation.com":
            return parse_wordpress(chap);
        case "foxaholic.com":
            return parse_foxaholic(chap);
        case "lightnovelbastion.com":
            return parse_bastion(chap);
        default:
            return parse_wordpress(chap);
    }
}

function parse_foxaholic(chap: Chapter): Chapter {
    let parser = new DOMParser();
    let dom = parser.parseFromString(chap.content, "text/html");
    let chapt_hdr = (<HTMLElement>dom.querySelector("#chapter-heading")).innerText;
    let chapt_node = <HTMLElement>dom.querySelector(".entry-content");
    let flair = chapt_node.querySelector("#jp-post-flair");
    if (flair) flair.remove();
    chap.title = chapt_hdr
    chap.html = chapt_node.innerHTML
    return chap;
}

function parse_bastion(chap: Chapter): Chapter {
    let parser = new DOMParser();
    let dom = parser.parseFromString(chap.content, "text/html");
    let chapt_hdr = (<HTMLElement>dom.querySelector("div.c-breadcrumb li.active")).innerText;
    let chapt_node = <HTMLElement>dom.querySelector(".reading-content");
    let flair = chapt_node.querySelector("#jp-post-flair");
    if (flair) flair.remove();
    let script = chapt_node.querySelectorAll("script");
    if (script) script.forEach(x => x.remove())
    chap.title = chapt_hdr
    chap.html = chapt_node.innerHTML
    return chap;
}
