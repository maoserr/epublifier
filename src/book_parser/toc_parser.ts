import { NovelData, Chapter } from "../common/novel_data";

export function parse_toc_links(dom_str: string, web_url: string): Chapter[] {
  let url = new URL(web_url);
  switch (url.hostname) {
    case "www.novelupdates.com":
      return getChapsNU(dom_str);
    case "bayabuscotranslation.com":
      return getChapsWP(dom_str);
    case "lightnovelbastion.com":
      return getChapsBastion(dom_str);
  }
  throw new RangeError("Invalid hostname");
}

function getChapsNU(dom_str: string) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(dom_str, "application/xml");
  console.log(dom)
  let chap_popup = dom.querySelector("#my_popupreading");
  let chap_lis = chap_popup.querySelectorAll("a");
  let chaps: Chapter[] = [];
  chap_lis.forEach((element) => {
    if (element.href.includes("extnu")) {
      chaps.unshift({
        content: element.innerText,
        url: element.href.replace("chrome-extension", "https"),
      });
    }
  });
  return chaps;
}

function getChapsWP(dom_str: string) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(dom_str, "application/xml");
  console.log(dom)
  let chap_cont = <HTMLElement>dom.querySelector(".entry-content");
  chap_cont.querySelector("#jp-post-flair").remove();

  let chap_lis = chap_cont.querySelectorAll("a");
  let chaps: Chapter[] = [];
  chap_lis.forEach((element) => {
    chaps.push({
      content: element.innerText,
      url: element.href.replace("chrome-extension", "https"),
    });
  });
  return chaps;
}

function getChapsBastion(dom_str: string) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(dom_str, "text/html");
  console.log(dom)
  let chap_cont = <HTMLElement>dom.querySelector("ul.main");
  let chap_lis = chap_cont.querySelectorAll("a:not(.has-child)");
  let chaps: Chapter[] = [];
  chap_lis.forEach((element) => {
    chaps.unshift({
      content: (<HTMLAnchorElement>element).innerText,
      url: (<HTMLAnchorElement>element).href.replace("chrome-extension", "https"),
    });
  });
  return chaps;
}