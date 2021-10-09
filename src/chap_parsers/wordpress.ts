import {Chapter} from "../common/novel_data";

export function parse_wordpress(chap: Chapter): Chapter {
    let parser = new DOMParser();
    let dom = parser.parseFromString(chap.content, "text/html");
    let chapt_hdr = (<HTMLElement>dom.querySelector(".entry-title")).innerText;
    let chapt_node = <HTMLElement>dom.querySelector(".entry-content");
    let flair = chapt_node.querySelector("#jp-post-flair");
    if (flair) flair.remove();
    chap.title = chapt_hdr
    chap.html = chapt_node.innerHTML
    return chap;
}
