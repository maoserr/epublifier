import { NovelData, Chapter } from "../common/novel_data";

export function parse_toc(chapters:HTMLElement, status:HTMLElement) {
  let novdata = new NovelData();
  let metadata = document.getElementById("metadata");
  let inps = chapters.querySelectorAll("input");
  let request = new XMLHttpRequest();

  novdata.title = (<HTMLInputElement>metadata.querySelector("#title")).value;
  novdata.author = (<HTMLInputElement>metadata.querySelector("#author")).value;
  novdata.cover = (<HTMLInputElement>metadata.querySelector("#cover")).value;

  function loop(i: number, length: number, resultArr: NovelData) {
    if (i >= length) {
      // parse_results(resultArr);
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
          status.innerHTML =
            "Parsed chapter " +
            i +
            ", (" +
            ((i / length) * 100).toFixed(1) +
            "%) <br/>";
          loop(i + 1, length, resultArr);
        } else {
          status.innerHTML =
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
}