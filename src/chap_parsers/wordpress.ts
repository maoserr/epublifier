import { Chapter, ChapterParsed } from "./../common/novel_data";

export function parse_wordpress(chap: Chapter): ChapterParsed {
  let parser = new DOMParser();
  let dom = parser.parseFromString(chap.content, "text/html");
  let chapt_hdr = (<HTMLElement>dom.querySelector(".entry-title")).innerText;
  let chapt_node = <HTMLElement>dom.querySelector(".entry-content");
  let flair = chapt_node.querySelector("#jp-post-flair");
  if(flair) flair.remove();
  return { title: chapt_hdr, html: chapt_node.innerHTML };
}
