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
      <div class="p-field p-col-12">
        <label for="pagetype">Page Type</label>
        <Dropdown id="pagetype" v-model="selectedPageType" :options="pageTypes" optionLabel="name"
                  placeholder="Select a Page Type"/>
      </div>
      <div class="p-field p-col-12">
        <label for="pagesource">Page Source</label>
        <Textarea id="pagesource" v-model="pagesource" rows="5" cols="30"/>
      </div>
      <div class="p-field p-col-12">
        <label for="start_chap">Page Source</label>
        <InputNumber id="start_chap" v-model="start"/>
      </div>
      <div class="p-field p-col-12">
        <label for="max_chap">Page Source</label>
        <InputNumber id="max_chap" v-model="max_cnt"/>
      </div>
      <div class="p-field p-col-12">
        <Button label="Extract Chapters" @click="start_main()"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IndexData, PopupMsg} from "../../common/novel_data";
import browser from "webextension-polyfill";

import Message from 'primevue/message';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

export default defineComponent({
  name: 'App',
  components: {
    Message,
    InputText,
    Dropdown,
    Textarea,
    InputNumber,
    Button
  },
  data() {
    return {
      url: "",
      selectedPageType: null,
      pageTypes: [
        {name: 'List of Chapters', code: 'loc'},
        {name: 'First Page', code: 'fp'},
      ],
      pagesource: "",
      title: "Epublifier",
      start: 1,
      max_cnt: 300,
      status_txt: "",
      ind_data: null as IndexData,
    }
  },
  /**
   * Mounted hook
   */
  mounted() {
    let vm = this
    browser.tabs.query({active: true, currentWindow: true}).then(
        tabs => {
          vm.url = tabs[0].url;
        }
    );
    browser.runtime.onMessage.addListener(
        request => {
          if (request.action == "getSource") {
            vm.ind_data = request.data;
          }
        }
    );
    this.check_curr_page();
  },
  methods: {
    start_main() {
      let vm = this
      browser.tabs.create({url: "main.html", active: true}).then(
          t => {
            vm.send_msg(t, {ind_data: vm.ind_data, start: vm.start, cnt: vm.max_cnt});
          }
      );
    },
    check_curr_page() {
      let vm = this
      vm.status_txt = "Injecting...";
      browser.tabs.executeScript(null, {file: "js/getPageSource.js",}).then(
          () => {
            vm.pagesource = vm.ind_data.source;
            vm.status_txt = "Script success.";
          }
      );
    },
    /**
     * Statis function to send parsed data/config to Main UI
     * @param tab
     * @param data
     */
    send_msg(
        tab: browser.Tabs.Tab,
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
          browser.tabs.onUpdated.removeListener(handler);
          browser.tabs.sendMessage(tabid, tab_msg);
        }
      };
      // in case we're faster than page load (usually):
      browser.tabs.onUpdated.addListener(handler);
      // just in case we're too late with the listener:
      browser.tabs.sendMessage(tab.id, tab_msg);
      msg.innerText += "Done";
    }
  }
})

</script>
<style>
body {
  width: 700px;
}
</style>