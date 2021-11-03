<template>
  <div id="app">
    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-col-12">
        <Message :closable="false">{{ status_txt }}</Message>
      </div>
      <div class="p-field p-col-4">
        <label for="url">Page URL</label>
        <InputText id="url" type="text" :value="url" disabled="disabled"/>
      </div>
      <ParserSelector
          :parser_obj="parsers"
          v-model="selectedParser"></ParserSelector>
      <NovelMetadata
          edit="disable"
          :tit="title"
          :auth="author"
          :cov="cover"
          :pub="publisher"
          :desc="description"></NovelMetadata>
      <div class="p-col-12">
        <br/>
        Detected Chapters: {{ chap_cnt }}
        <br/>
      </div>
      <div class="p-field p-col-6 p-md-3">
        <Button label="(Re)Parse Source" @click="parse_source()"/>
      </div>
      <div class="p-field p-col-6 p-md-3">
        <Button label="Load Chapter List" class="p-button-success" icon="pi pi-check" @click="start_main()"
                :disabled="main_disable"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import browser from "webextension-polyfill";

import ParserSelector from "../../components/ParserSelector.vue";
import NovelMetadata from "../../components/NovelMetadata.vue";

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


export default defineComponent({
  name: 'App',
  components: {
    NovelMetadata,
    ParserSelector,
    Message,
    InputText,
    Dropdown,
    InputNumber,
    Button
  },
  data() {
    return {
      url: "",
      selectedParser: "main||main_parser",
      title: "Epublifier",
      publisher: "",
      author: "",
      cover: "",
      description: "",
      status_txt: "",
      page_src: "",
      chaps: [] as Chapter[],
      parsers: null,
    }
  },
  computed: {
    main_disable(): string {
      return this.chaps.length == 0 ? "disabled" : null;
    },
    chap_cnt(): number {
      return this.chaps.length;
    },
  },
  /**
   * Mounted hook
   */
  async mounted() {
    let vm = this;
    vm.parsers = await load_parsers();

    let tabs = await browser.tabs.query({active: true, currentWindow: true})
    vm.url = tabs[0].url;
    window.addEventListener('message', function (event) {
      let command = event.data.command;
      vm.status_txt = event.data.message;
      switch (command) {
        case 'toc':
          vm.chaps = event.data.chaps;
          vm.selectedParser = event.data.parser;
          vm.title = event.data.meta["title"] || "N/A";
          vm.description = event.data.meta["description"] || "N/A";
          vm.author = event.data.meta["author"] || "N/A";
          vm.cover = event.data.meta["cover"] || null;
          vm.publisher = event.data.meta["publisher"] || "N/A";
          break;
        default:
          vm.selectedParser = "main||toc_parsers||chaps_all_links";
          break;
      }
    });
    browser.runtime.onMessage.addListener(vm.source_received);
    vm.status_txt = "Extracting source from page..."
    setTimeout(this.extract_curr_source, 100);
  },
  methods: {
    source_received(request) {
      let vm = this;
      browser.runtime.onMessage.removeListener(this.source_received);
      vm.status_txt = "Received response.";
      if (request.action == "getSource") {
        if (request.data == null) {
          vm.status_txt = "Script failed.";
        } else {
          vm.page_src = request.data;
          vm.parse_source();
        }
      }
    },
    /**
     * Start Main  UI
     */
    async start_main() {
      let vm = this
      let tab = await browser.tabs.create({url: "main.html", active: true});
      let tab_msg = {
        action: "newTabSource",
        data: JSON.stringify(vm.chaps),
        parser: vm.selectedParser,
        metadata: {
          title: vm.title,
          publisher: vm.publisher,
          author: vm.author,
          cover: vm.cover,
          description: vm.description
        }
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
      setTimeout(() => browser.tabs.sendMessage(tab.id, tab_msg).catch(e => vm.status_txt = "Done: " + e),
          500);
      vm.status_txt = "Done";
    },
    /**
     * Get source from current page
     */
    async extract_curr_source() {
      let vm = this
      try {
        await browser.tabs.executeScript(null, {file: "js/getPageSource.js",})
      } catch (error) {
        vm.status_txt = "Injection failed: " + error.message;
      }
    },
    async parse_source() {
      let vm = this;
      try {
        vm.status_txt = "Parsing page content...";
        let iframe: HTMLIFrameElement = document.getElementById("sandbox") as HTMLIFrameElement;
        iframe.contentWindow.postMessage({
          selparser: vm.selectedParser,
          parser: JSON.stringify(vm.parsers),
          doc: JSON.stringify(vm.page_src),
        }, '*');
      } catch (e) {
        vm.status_txt = "Unable to parse content: " + e;
      }
    }
  }
})

</script>
<style>
body {
  width: 700px;
  min-height: 550px;
}
</style>