<template>
  <div id="app">
    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-col-12">
        <Message :closable="false">{{ status_txt }}</Message>
      </div>
      <div class="p-field p-col-12">
        <label for="url">Page URL</label>
        <InputText id="url" type="text" :value="url"/>
      </div>
      <div class="p-field p-col-6">
        <label for="pagetype">Page Type</label>
        <Dropdown id="pagetype" v-model="selectedPageType" :options="pageTypes" optionLabel="name"
                  placeholder="Select a Page Type"/>
      </div>
      <div class="p-field p-col-6">
        <label for="pagefunc">Parser</label>
        <Dropdown id="pagefunc" v-model="selectedParserType" :options="parsersTypes" optionLabel="name"
                  placeholder="Select a Parser"/>
      </div>
      <div class="p-col-12">
        <br/>
        Detected Chapters: {{ chap_cnt }} <br/>
        Detected Page type: {{ page_type }} <br/>
        <br/>
      </div>
      <div class="p-field p-col-12">
        <Button label="Load Page List" @click="start_main()"/>
      </div>
      <div class="p-field p-col-12">
        <Button label="Load Page List" @click="start_main()"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import browser from "webextension-polyfill";

import Message from 'primevue/message';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

import {Chapter} from "../../common/novel_data";
import {load_parsers, Parser} from "../../common/parser_loader"
import {load} from "js-yaml";


export default defineComponent({
  name: 'App',
  components: {
    Message,
    InputText,
    Dropdown,
    InputNumber,
    Button
  },
  data() {
    return {
      url: "",
      selectedPageType: null,
      pageTypes: [
        {name: 'Table of Contents', code: 'toc'},
        {name: 'First Page', code: 'fp'},
      ],
      title: "Epublifier",
      chap_cnt: 0,
      page_type: "List of Chapters",
      status_txt: "",
      chaps: [] as Chapter[],
      parsers: null,
      selectedParserType: null,
      parsersTypes: [{name: 'Test', code: 'test'}],
    }
  },
  /**
   * Mounted hook
   */
  mounted() {
    let vm = this;
    load_parsers().then(result => {
      vm.parsers = result;
      let parser_yml: Parser = load(result) as Parser;
      vm.parsersTypes = []
      for (let k in parser_yml["toc_parsers"]) {
        vm.parsersTypes.push({name: parser_yml["toc_parsers"][k]["name"], code: k})
      }
      browser.tabs.query({active: true, currentWindow: true}).then(
          tabs => {
            vm.url = tabs[0].url;
          }
      );
      window.addEventListener('message', function (event) {
        let command = event.data.command;
        vm.status_txt = event.data.message;
        switch (command) {
          case 'toc':
            vm.chaps = event.data.chaps;
            vm.chap_cnt = vm.chaps.length;
            vm.selectedPageType = vm.pageTypes.find((x: any) => x.code === 'toc');
            vm.selectedParserType = vm.parsersTypes.find((x: any) => x.code === event.data.parser);
            break;
        }
      });
      browser.runtime.onMessage.addListener(
          request => {
            vm.status_txt = "Received response.";
            if (request.action == "getSource") {
              if (request.data == null) {
                vm.status_txt = "Script failed.";
              } else {
                try {
                  vm.status_txt = "Parsing page content...";
                  let iframe: HTMLIFrameElement = document.getElementById("sandbox") as HTMLIFrameElement;
                  iframe.contentWindow.postMessage({
                    command: 'main_parse',
                    parser: vm.parsers,
                    doc: request.data
                  }, '*');
                } catch (e) {
                  vm.status_txt = "Unable to parse content: " + e;
                }
              }
            }
          }
      );
      vm.status_txt = "Parsing page..."
      setTimeout(this.check_curr_page, 100);
    }).catch(e => vm.status_txt = e);
  },
  methods: {
    /**
     * Start Main  UI
     */
    start_main() {
      let vm = this
      browser.tabs.create({url: "main.html", active: true}).then(
          t => {
            vm.send_msg(t, vm.chaps);
          }
      );
    },
    /**
     * Get source from current page
     */
    check_curr_page() {
      let vm = this
      vm.status_txt = "Injecting...";
      browser.tabs.executeScript(null, {file: "js/getPageSource.js",}).then(
          () => vm.status_txt = "Script injected. Awaiting response."
      ).catch(
          error => {
            vm.status_txt = "Injection failed: " + error.message;
          }
      );
    },
    /**
     * Function to send parsed data/config to Main UI
     * @param tab Browser tab object
     * @param data List of chapters extracted
     */
    send_msg(
        tab: browser.Tabs.Tab,
        data: Chapter[]
    ) {
      let vm = this;
      let tab_msg = {
        action: "newTabSource",
        data: JSON.stringify(data)
      }
      let handler = function (tabid: number, changeInfo: any) {
        if (tabid === tab.id && changeInfo.status === "complete") {
          browser.tabs.onUpdated.removeListener(handler);
          browser.tabs.sendMessage(tabid, tab_msg);
        }
      };
      // in case we're faster than page load (usually):
      browser.tabs.onUpdated.addListener(handler)
      // just in case we're too late with the listener:
      setTimeout(()=>browser.tabs.sendMessage(tab.id, tab_msg).catch(e => vm.status_txt = "Done"),
          500);
      vm.status_txt = "Done";
    }
  }
})

</script>
<style>
body {
  width: 700px;
}
</style>