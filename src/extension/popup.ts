let body = document.body;
let get_chapters = document.getElementById("get_chapters");
let msg = document.getElementById("msg");

get_chapters.onclick = function () {
  msg.innerText += "Injecting...";
  chrome.tabs.executeScript(
    null,
    {
      file: "js/getPageSource.js",
    },
    function () {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error
      if (chrome.runtime.lastError) {
        msg.innerText =
          "There was an error injecting script : \n" +
          chrome.runtime.lastError.message;
      } else {
        msg.innerText = "Injected script.";
      }
    }
  );
};

chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.action == "getSource") {
    let src = request.source;
    let type = (<HTMLInputElement>document.getElementById("type")).value;
    switch (type) {
      case "novel_updates":
        chrome.tabs.create(
          { url: "novel_updates.html", active: true },
          function (t) {
            send_msg(t, src);
          }
        );
        break;
    }
  }
});

function send_msg(tab: chrome.tabs.Tab, src: string) {
  let handler = function (tabid: number, changeInfo: any) {
    if (tabid === tab.id && changeInfo.status === "complete") {
      chrome.tabs.onUpdated.removeListener(handler);
      chrome.tabs.sendMessage(tabid, { action: "newTabSource", source: src });
    }
  };
  // in case we're faster than page load (usually):
  chrome.tabs.onUpdated.addListener(handler);
  // just in case we're too late with the listener:
  chrome.tabs.sendMessage(tab.id, { action: "newTabSource", source: src });
  msg.innerText += "Done";
}

window.onload = function onWindowLoad() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tabURL = tabs[0].url;
    console.log(tabURL);
    (<HTMLInputElement>document.getElementById("url")).value = tabURL;
  });
};
