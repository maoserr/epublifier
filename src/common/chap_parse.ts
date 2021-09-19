import { Chapter, ChapterParsed } from "./../common/novel_data";
import { parse_wordpress } from "../chap_parsers/wordpress";
import { parse_lnt } from "../chap_parsers/lightnoveltran";

export function chap_parse(chap: Chapter): ChapterParsed {
  let url = new URL(chap.url);
  switch (url.hostname) {
    case "lightnovelstranslations.com":
      return parse_lnt(chap);
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

function parse_foxaholic(chap: Chapter): ChapterParsed {
  let parser = new DOMParser();
  let dom = parser.parseFromString(chap.content, "text/html");
  let chapt_hdr = (<HTMLElement>dom.querySelector("#chapter-heading")).innerText;
  let chapt_node = <HTMLElement>dom.querySelector(".entry-content");
  let flair = chapt_node.querySelector("#jp-post-flair");
  if(flair) flair.remove();
  return { title: chapt_hdr, html: chapt_node.innerHTML };
}

function parse_bastion(chap: Chapter): ChapterParsed {
  let parser = new DOMParser();
  let dom = parser.parseFromString(chap.content, "text/html");
  let chapt_hdr = (<HTMLElement>dom.querySelector("div.c-breadcrumb li.active")).innerText;
  let chapt_node = <HTMLElement>dom.querySelector(".reading-content");
  let flair = chapt_node.querySelector("#jp-post-flair");
  if(flair) flair.remove();
  let script = chapt_node.querySelectorAll("script");
  if(script) script.forEach(x=>x.remove())
  return { title: chapt_hdr, html: chapt_node.innerHTML };
}
