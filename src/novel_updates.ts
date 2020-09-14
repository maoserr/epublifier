import jEpub from "jepub/dist/jepub";
import { saveAs } from "file-saver";

interface Chap {
  text: string;
  link: string;
}

interface ChapCont {
  title: string;
  content: string;
}

let message = document.getElementById("message");
let compile_epub = document.getElementById("compile_epub");
let compile_result = document.getElementById("compile_result");

if ("runtime" in chrome && "onMessage" in chrome.runtime) {
  function getChaps(dom_str: string) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(dom_str, "application/xml");
    let chap_popup = dom.querySelector("#my_popupreading");
    let chap_lis = chap_popup.querySelectorAll("a");
    let chaps: Chap[] = [];
    chap_lis.forEach((element) => {
      if (element.href.includes("extnu")) {
        chaps.unshift({
          text: element.innerText,
          link: element.href.replace("chrome-extension", "https"),
        });
      }
    });
    return chaps;
  }

  chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "getSource") {
      let chap_pop = getChaps(request.source);
      let msg_html = "";
      let lbl_html: string;
      let txt_html: string;
      chap_pop.forEach((el) => {
        lbl_html = '<label for="' + el.text + '">' + el.text + "</label>";
        let txt_html =
          '<input type="text" id="' +
          el.text +
          '" value="' +
          el.link +
          '" readonly />';
        msg_html += lbl_html + txt_html + "<br/>";
      });
      message.innerHTML = msg_html;
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
          message.innerText =
            "There was an error injecting script : \n" +
            chrome.runtime.lastError.message;
        }
      }
    );
  }
  window.onload = onWindowLoad;
}

function parse_results(arr: Chap[]) {
  let chaps: ChapCont[] = [];
  let title: string = "Nothing";
  let author: string = "Nothing";
  let publisher: string = "Nothing";
  let description: string = "Nothing";
  for (let i in arr) {
    compile_result.innerHTML = "Compiling " + i;
    let parser = new DOMParser();
    let dom = parser.parseFromString(arr[i].text, "text/html");
    let chapt_hdr = (<HTMLElement>dom.querySelector(".entry-title")).innerText;
    let chapt_html = (<HTMLElement>dom.querySelector(".entry-content"))
      .innerHTML;
    chaps.push({ title: chapt_hdr, content: chapt_html });
  }
  compile_result.innerHTML = "Fetching cover image...";
  fetch("https://cdn.novelupdates.com/images/2020/04/EUgeIkdU8AAxOff.jpeg")
    .then((response) => {
      if (response.ok) return response.blob();
      throw "Network response was not ok.";
    })
    .then((blob) => {
      const jepub = new jEpub();
      jepub.init({
        i18n: "en",
        title: title,
        author: author,
        publisher: publisher,
        description: description,
      });

      jepub.cover(blob);

      for (let i in chaps) {
        jepub.add(chaps[i].title, chaps[i].content);
      }

      compile_result.innerHTML = "Generating ePub";
      jepub
        .generate("blob", function updateCallback(metadata) {
          compile_result.innerHTML = "Zip: " + metadata.percent.toFixed(2) + " %";
          if (metadata.currentFile) {
            compile_result.innerHTML += "current file = " + metadata.currentFile;
          }
        })
        .then((filecontent: Blob) => {
          console.log(filecontent);
          let url = URL.createObjectURL(filecontent);

          chrome.downloads.download({
            url: url,
            filename: "test.epub"
          })
        })
        .catch((err: ExceptionInformation) => {
          console.error(err);
        });
    });
}
compile_epub.onclick = function () {
  let inps = message.querySelectorAll("input");
  let request = new XMLHttpRequest();
  (function loop(i, length, resultArr: Chap[]) {
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
            text: request.responseText,
            link: request.responseURL,
          });
          compile_result.innerHTML = "Parsed chapter " + i + " <br/>";
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
  })(0, inps.length, []);
};
