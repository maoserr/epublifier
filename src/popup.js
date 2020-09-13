let body = document.body;

body.onload = function (element) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tabURL = tabs[0].url;
    document.getElementById("url").value = tabURL;
  });
};
get_chapters.onclick = function () {
  let type = document.getElementById("type").value
  switch(type) {
    case "novel_updates":
      window.location="novel_updates.html"
      break;
  }
};