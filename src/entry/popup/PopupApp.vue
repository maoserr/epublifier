<template>
  <div id="app" class="pure-g">
    <div class="content pure-u-1">
      <form class="pure-form pure-form-aligned">
        <div class="pure-control-group">
          <label for="page_type">Page Type</label>
          <select id="page_type">
            <option value="toc">Table of Contents</option>
            <option value="first">First Page</option>
          </select>
        </div>
        <div class="pure-control-group">
          <label for="url">Page URL:</label>
          <input type="text" id="url" style="width:70%"/>
        </div>
        <div class="pure-control-group">
          <label for="css_selector">CSS Selector:</label>
          <input type="text" id="css_selector" style="width:70%"/>
        </div>
        <div class="pure-control-group">
          <label for="chapt_start">Chapter Start:</label>
          <input type="number" id="chapt_start" :value="start"/>
        </div>
        <div class="pure-control-group">
          <label for="chapt_cnt">Max Chapers:</label>
          <input type="number" id="chapt_cnt" :value="max_cnt"/>
        </div>
        <div class="pure-controls">
          <div id="msg">{{ status_txt }}</div>
          <input
              type="button"
              value="Start UI"
              class="pure-button"
              id="start_ui"
              v-on:click="start_main()"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';
import {IndexData, PopupMsg} from "../../common/novel_data";

@Component
export default class MainApp extends Vue {
  title: string = "Epublifier"
  start: number = 1
  max_cnt: number = 300
  status_txt: string = ""
  ind_data: IndexData = null

  /**
   * Mounted hook
   */
  mounted() {
    let vm = this
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      (<HTMLInputElement>document.getElementById("url")).value = tabs[0].url;
    });
    if ("runtime" in chrome && "onMessage" in chrome.runtime) {
      chrome.runtime.onMessage.addListener(function (request, sender) {
        if (request.action == "getSource") {
          vm.ind_data = request.data;
        }
      });
      this.check_curr_page();
    }
  }

  start_main() {
    let vm = this
    chrome.tabs.create({url: "main.html", active: true}, function (t) {
      vm.send_msg(t, {ind_data: vm.ind_data, start: vm.start, cnt: vm.max_cnt});
    });
  }

  check_curr_page() {
    let vm = this
    vm.status_txt = "Injecting...";
    chrome.tabs.executeScript(
        null,
        {
          file: "js/getPageSource.js",
        },
        function () {
          // If you try and inject into an extensions page or the webstore/NTP you'll get an error
          if (chrome.runtime.lastError) {
            vm.status_txt = "There was an error injecting script : \n" +
                chrome.runtime.lastError.message;
          } else {
            vm.status_txt = "Scrip success";
          }
        }
    );
  }

  /**
   * Statis function to send parsed data/config to Main UI
   * @param tab
   * @param data
   */
  send_msg(
      tab: chrome.tabs.Tab,
      data: PopupMsg
  ) {
    let msg = document.getElementById("msg");
    msg.innerText += data.start
    let tab_msg = {
      action: "newTabSource",
      data: data
    }
    let handler = function (tabid: number, changeInfo: any) {
      if (tabid === tab.id && changeInfo.status === "complete") {
        chrome.tabs.onUpdated.removeListener(handler);
        chrome.tabs.sendMessage(tabid, tab_msg);
      }
    };
    // in case we're faster than page load (usually):
    chrome.tabs.onUpdated.addListener(handler);
    // just in case we're too late with the listener:
    chrome.tabs.sendMessage(tab.id, tab_msg);
    msg.innerText += "Done";
  }
}
</script>
