<template>
  <div id="app">
    <label for="url">Page URL:</label>
    <input type="text" id="url" readonly />
    <br />
    <label for="type">Source Type:</label>
    <select id="type">
      <option value="novel_updates">Novel Updates</option>
    </select>
    <br />
    <label for="chapt_start">Chapter Start:</label>
    <input type="number" id="chapt_start" value="1" />
    <br />
    <label for="chapt_limit">Limit # of Chapters</label>
    <input type="checkbox" id="chapt_limit" />
    <br />
    <label for="chapt_cnt">Chapter Count:</label>
    <input type="number" id="chapt_cnt" />
    <br />
    <label for="page_type">Page Type</label>
    <select id="page_type">
      <option value="toc">Table of Contents</option>
      <option value="first">First Page</option>
    </select>
    <div id="msg"></div>
    <button id="get_chapters" v-on:click="get_chapters()">Get Chapters</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class App extends Vue {
  title: string;

  constructor() {
    super();
    this.title = "Epublifier";
  }
  on_load() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      let tabURL = tabs[0].url;
      console.log(tabURL);
      (<HTMLInputElement>document.getElementById("url")).value = tabURL;
    });
  }
  get_chapters() {
    let msg = document.getElementById("msg");
    msg.innerText += "Injecting...";
    chrome.tabs.executeScript(
      null,
      {
        file: "js/getPageSource.js",
      },
      function() {
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
  }
}
</script>
