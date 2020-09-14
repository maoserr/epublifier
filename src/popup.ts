let body = document.body;
let get_chapters = document.getElementById("get_chapters");
debugger;

body.onload = function (element) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tabURL = tabs[0].url;
    (<HTMLInputElement>document.getElementById("url")).value = tabURL;
  });
};
get_chapters.onclick = function () {
  let type = (<HTMLInputElement>document.getElementById("type")).value
  switch(type) {
    case "novel_updates":
      window.location.href="novel_updates.html"
      break;
  }
};