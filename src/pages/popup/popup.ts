import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
})

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
  let msg = document.getElementById("msg");
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
