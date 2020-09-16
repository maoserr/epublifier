import { ChapterParsed } from "./../common/novel_data";

export function parse_wordpress(url: string, content: string): ChapterParsed {
  let parser = new DOMParser();
  let dom = parser.parseFromString(content, "text/html");
  let chapt_hdr = (<HTMLElement>dom.querySelector(".entry-title")).innerText;
  let chapt_node = <HTMLElement>dom.querySelector(".entry-content");
  chapt_node.querySelector("#jp-post-flair").remove();
  return { title: chapt_hdr, html: chapt_node.innerHTML };
}
