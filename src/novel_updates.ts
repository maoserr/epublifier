import jEpub from "jepub/dist/jepub";
import { parse_wordpress } from "./chap_parsers/wordpress";
import { NovelData, Chapter } from "./common/novel_data";

let chapters = document.getElementById("chapters");
let compile_epub = document.getElementById("compile_epub");
let compile_result = document.getElementById("compile_result");

if ("runtime" in chrome && "onMessage" in chrome.runtime) {
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
    });

    let metadata = document.getElementById("metadata")
    let cover_url = <HTMLInputElement>metadata.querySelector("#cover")
    let cover_img = <HTMLImageElement>metadata.querySelector("#img_show")
    cover_url.value= dom.querySelector(".seriesimg").querySelector("img").src
    cover_img.src = cover_url.value
    let title = <HTMLInputElement>metadata.querySelector("#title")
    title.value =(<HTMLElement>dom.querySelector(".seriestitlenu")).innerText
    let author = <HTMLInputElement>metadata.querySelector("#author")
    author.value = dom.querySelector("#showauthors").querySelector("a").innerText
    return chaps;
  }

  chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "getSource") {
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
  });

  function onWindowLoad() {
    chrome.tabs.executeScript(
      null,
      {
        file: "getPageSource.js",
      },
      function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
          chapters.innerText =
            "There was an error injecting script : \n" +
            chrome.runtime.lastError.message;
        }
      }
    );
  }
  window.onload = onWindowLoad;
}

function parse_results(nov_data: NovelData) {
  for (let i in nov_data.chapters) {
    compile_result.innerHTML = "Compiling " + i;
    let chap = parse_wordpress(nov_data.chapters[i].url, nov_data.chapters[i].content);
    nov_data.chapter_parsed[nov_data.chapters[i].url] = chap
  }
  compile_result.innerHTML = "Fetching cover image...";
  fetch(nov_data.cover)
    .then((response) => {
      if (response.ok) return response.blob();
      throw "Network response was not ok.";
    })
    .then((blob) => {
      const jepub = new jEpub();
      jepub.init({
        i18n: "en",
        title: nov_data.title,
        author: nov_data.author,
        publisher: nov_data.publisher,
        description: nov_data.description,
      });

      jepub.cover(blob);

      for (let i in nov_data.chapters) {
        let id = nov_data.chapters[i].url
        jepub.add(nov_data.chapter_parsed[id].title, nov_data.chapter_parsed[id].html);
      }

      compile_result.innerHTML = "Generating ePub";
      jepub
        .generate("blob", function updateCallback(metadata) {
          compile_result.innerHTML =
            "Zip: " + metadata.percent.toFixed(2) + " %";
          if (metadata.currentFile) {
            compile_result.innerHTML +=
              "current file = " + metadata.currentFile;
          }
        })
        .then((filecontent: Blob) => {
          console.log(filecontent);
          let url = URL.createObjectURL(filecontent);

          chrome.downloads.download({
            url: url,
            filename: nov_data.filename,
          });
        })
        .catch((err: ExceptionInformation) => {
          console.error(err);
        });
    });
}
compile_epub.onclick = function () {
  let novdata = new NovelData();
  let metadata = document.getElementById("metadata");
  let inps = chapters.querySelectorAll("input");
  let request = new XMLHttpRequest();

  novdata.title = (<HTMLInputElement>metadata.querySelector("#title")).value;
  novdata.author = (<HTMLInputElement>metadata.querySelector("#author")).value;
  novdata.cover = (<HTMLInputElement>metadata.querySelector("#cover")).value;

  function loop(i: number, length: number, resultArr: NovelData) {
    if (i >= length) {
      parse_results(resultArr);
      return;
    }
    let url = inps[i].value;

    request.open("GET", url);
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          resultArr.push({
            content: request.responseText,
            url: request.responseURL,
          });
          compile_result.innerHTML =
            "Parsed chapter " +
            i +
            ", (" +
            (i / length * 100).toFixed(1) +
            "%) <br/>";
          loop(i + 1, length, resultArr);
        } else {
          compile_result.innerHTML =
            "Invalid response " +
            request.status +
            " in chapter url: " +
            inps[i].value;
        }
      }
    };
    request.send();
  }
  loop(0, inps.length, novdata);
};
