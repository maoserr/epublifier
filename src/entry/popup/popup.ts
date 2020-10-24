import Vue from "vue";
import App from "./PopupApp.vue";

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  template: "<App/>",
  components: { App },
});

if ("runtime" in chrome && "onMessage" in chrome.runtime) {
  chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
      let src = request.source;
      chrome.tabs.create({ url: "main.html", active: true }, function(t) {
        send_msg(t, src);
      });
    }
  });
}

function send_msg(tab: chrome.tabs.Tab, src: string) {
  let msg = document.getElementById("msg");
  let handler = function(tabid: number, changeInfo: any) {
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
