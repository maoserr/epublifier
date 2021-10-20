<template>
  <div id="app">
    <Dialog header="Header" v-model:visible="diag_show" :modal="true" class="p-fluid">
      <div class="p-field">
        <label for="title">Name</label>
        <InputText id="title" v-model.trim="chap.title" required="true" autofocus :class="{'p-invalid': !chap.title}"/>
        <small class="p-error" v-if="!chap.title">Title is required.</small>
      </div>
      <div class="p-field">
        <label for="innerhtml">Parsed HTML</label>
        <Textarea id="innerhtml" v-model="chap.html_parsed" disabled required="true" rows="30" cols="150"/>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hide_dialog"/>
        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="save_chap"/>
      </template>
    </Dialog>

    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-col-12">
        <Message :closable="false">{{ status_txt }}</Message>
        <ProgressBar :value="progress_val" :showValue="true" style="height: .5em"/>
      </div>
      <div class="p-field p-col-12">
        <DataTable :value="chapts"
                   v-model:selection="selected_chaps"
                   selectionMode="multiple"
                   scrollable scrollHeight="500px"
                   :paginator="true" :rows="100"
                   class="p-datatable-sm"
                   paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                   :rowsPerPageOptions="[100, 200,500]" responsiveLayout="scroll"
                   currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
          <Column field="url_title" header="URL Title" :sortable="true"></Column>
          <Column field="url" header="URL">
            <template #body="slotProps">
              <a :href="slotProps.data.url" target="_blank" rel="noopener noreferrer">{{ slotProps.data.url }}</a>
            </template>
          </Column>
          <Column field="html_parsed" header="Parsed HTML">
            <template #body="slotProps">
              {{ slotProps.data.html_parsed ? "Parsed" : "" }}
            </template>
          </Column>
          <Column :exportable="false" style="min-width:8rem">
            <template #body="slotProps">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-sm"
                      @click="edit_chap(slotProps.data)"/>
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="p-field p-col-6">
        <Button label="Extract Chapters" @click="extract_chaps()"/>
      </div>
      <div class="p-field p-col-6">
        <Button label="Compile Epub" @click="gen_epub()"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import {defineComponent} from "vue";

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';     //optional for column grouping
import Message from 'primevue/message';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Dialog from 'primevue/dialog';
import Textarea from "primevue/textarea";
import InputText from "primevue/inputtext";

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

import {NovelData, Chapter} from "../../common/novel_data";
import {generate_epub} from "../../common/epub_generator";
import {load_parsers} from "../../common/parser_loader";
import pLimit from "p-limit";

export default defineComponent({
  name: 'App',
  components: {
    Message,
    DataTable,
    Column,
    ColumnGroup,
    Button,
    ProgressBar,
    Dialog,
    Textarea,
    InputText
  },
  data() {
    return {
      status_txt: "",
      progress_val: 0,
      chap: {} as Chapter,
      selected_chaps: null as Chapter[],
      chapts: null as Chapter[],
      parsers: null,
      diag_show: false,
    }
  },
  created() {
    if ("runtime" in browser && "onMessage" in browser.runtime) {
      browser.runtime.onMessage.addListener(this.msg_func);
    }
  },
  mounted() {
    let vm = this;
    load_parsers().then(result => {
      vm.parsers = result;
      window.addEventListener('message', function (event) {
        let command = event.data.command;
        vm.status_txt = event.data.message;
        switch (command) {
          case 'chap':
            let id = event.data.id;
            let title = event.data.title;
            let html = event.data.html;
            vm.selected_chaps[id].html_parsed = html;
            vm.selected_chaps[id].title = title;
            break;
        }
      });
    });
  },
  methods: {
    msg_func(request: any, sender: any) {
      let vm = this;
      browser.runtime.onMessage.removeListener(this.msg_func);
      if (request.action == "newTabSource") {
        vm.chapts = JSON.parse(request.data);
        vm.status_txt = "Loaded chapters.";
      }
    },
    extract_chaps() {
      let vm = this;
      let chap_fetches = [];
      let cnt_slice = 100.0 / vm.selected_chaps.length;
      vm.progress_val = 0;
      const limit = pLimit(3);
      for (let c in vm.selected_chaps) {
        chap_fetches.push(
            limit(() =>
                fetch(vm.selected_chaps[c].url)
                    .then(x => x.text())
                    .then(x => {
                      try {
                        vm.selected_chaps[c].html = x;
                        vm.status_txt = "Parsing chapter content: " + c;
                        let iframe: HTMLIFrameElement = document.getElementById("sandbox") as HTMLIFrameElement;
                        iframe.contentWindow.postMessage({
                          command: 'chap_parse',
                          parser: vm.parsers,
                          doc: x,
                          id: c,
                          url: vm.selected_chaps[c].url,
                          url_title: vm.selected_chaps[c].url_title,
                        }, '*');
                      } catch (e) {
                        vm.status_txt = "Unable to parse content: " + e;
                      }
                      vm.progress_val += cnt_slice;
                    })
            )
        );
      }
      Promise.all(chap_fetches).then(() => vm.status_txt = "All selected chapters extracted.");
    },
    edit_chap(chap: Chapter) {
      this.chap = chap;
      this.diag_show = true;
    },
    hide_dialog() {
      this.diag_show = false;
    },
    save_chap() {
    },
    gen_epub() {
      let vm = this;
      let nov_data = new NovelData(this.selected_chaps);
      generate_epub(nov_data, function (msg: string) {
        vm.status_txt = msg
      });
    },
  }
});


</script>
