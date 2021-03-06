import Vue from "vue";
import App from "./MainApp.vue";

import { generate_epub } from "../../common/epub_generator"
import { chap_parse } from "../../common/chap_parse";
import { NovelData, Chapter } from "../../common/novel_data";

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  template: "<App/>",
  components: { App },
});

let chapters = document.getElementById("chapters");
let compile_epub = document.getElementById("compile_epub");
let compile_result = document.getElementById("compile_result");

let msg_func = function (request: any, sender: any) {
  // Ensure it is run only once, as we will try to message twice
  chrome.runtime.onMessage.removeListener(msg_func);

  if (request.action == "newTabSource") {
    let chap_pop = getChaps(request.source);
    let msg_html = "";
    let lbl_html: string;
    chap_pop.forEach((el) => {
      lbl_html = '<label for="' + el.content + '">' + el.content + "</label>";
      let txt_html =
        '<input type="text" id="' +
        el.content +
        '" value="' +
        el.url +
        '" readonly />';
      msg_html += lbl_html + txt_html + "<br/>";
    });
    chapters.innerHTML = msg_html;
  }
};

if ("runtime" in chrome && "onMessage" in chrome.runtime) {
  chrome.runtime.onMessage.addListener(msg_func);
}

function getChaps(dom_str: string) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(dom_str, "application/xml");
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
    console.log(element)
  });

  // let metadata = document.getElementById("metadata");
  // let cover_url = <HTMLInputElement>metadata.querySelector("#cover");
  // let cover_img = <HTMLImageElement>metadata.querySelector("#img_show");
  // cover_url.value = dom.querySelector(".seriesimg").querySelector("img").src;
  // cover_img.src = cover_url.value;
  // let title = <HTMLInputElement>metadata.querySelector("#title");
  // title.value = (<HTMLElement>dom.querySelector(".seriestitlenu")).innerText;
  // let author = <HTMLInputElement>metadata.querySelector("#author");
  // author.value = dom
  //   .querySelector("#showauthors")
  //   .querySelector("a").innerText;
  return chaps;
}

function parse_results(nov_data: NovelData) {
  for (let i in nov_data.chapters) {
    compile_result.innerHTML = "Compiling " + i;
    let chap = chap_parse(nov_data.chapters[i]);
    nov_data.chapter_parsed[nov_data.chapters[i].url] = chap;
  }
  generate_epub(nov_data, compile_result)
}
compile_epub.onclick = function () {
  // parse_results()
};
