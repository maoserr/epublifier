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
        <Textarea id="innerhtml" v-model="chap.html_parsed" required="true" rows="30" cols="150"/>
      </div>
      <template #footer>
        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="save_chap"/>
      </template>
    </Dialog>
    <div class="p-fluid p-formgrid p-grid">
      <NovelMetadata
          v-model:tit="title"
          v-model:auth="author"
          v-model:cov="cover"
          v-model:pub="publisher"
          v-model:desc="description"></NovelMetadata>
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
      <div class="p-field p-col-12">
        <Message :closable="false">{{ status_txt }}</Message>
        <ProgressBar :value="progress_val" :showValue="true" style="height: .5em"/>
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

import * as Parallel from 'async-parallel';
import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

import {NovelData, Chapter} from "../../common/novel_data";
import {generate_epub} from "../../common/epub_generator";
import {load_parsers} from "../../common/parser_loader";

import NovelMetadata from "../../components/NovelMetadata.vue";

export default defineComponent({
  name: 'App',
  components: {
    NovelMetadata,
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
      title: "Epublifier",
      publisher: "",
      author: "",
      cover: "",
      description: "",
      chap: {} as Chapter,
      selected_chaps: null as Chapter[],
      chapts: null as Chapter[],
      parsers: null,
      diag_show: false,
      parsedoc: "",
    }
  },
  created() {
    if ("runtime" in browser && "onMessage" in browser.runtime) {
      browser.runtime.onMessage.addListener(this.msg_func);
    }
  },
  async mounted() {
    let vm = this;
    vm.parsers = await load_parsers();
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
  },
  methods: {
    msg_func(request: any, sender: any) {
      let vm = this;
      browser.runtime.onMessage.removeListener(this.msg_func);
      if (request.action == "newTabSource") {
        vm.chapts = JSON.parse(request.data);
        vm.title = request.metadata.title || "N/A";
        vm.publisher = request.metadata.publisher || "N/A";
        vm.author = request.metadata.author || "N/A";
        vm.cover = request.metadata.cover || null;
        vm.description = request.metadata.description || "N/A";
        vm.parsedoc = request.parser.split("||")[0];
        vm.status_txt = "Loaded chapters.";
      }
    },
    async extract_chaps() {
      let vm = this;
      let cnt_slice = 100.0 / vm.selected_chaps.length;
      vm.progress_val = 0;
      let extract_chap = async function (id) {
        try {
          if (vm.selected_chaps[id].url != "none") {
            let f_res = await fetch(vm.selected_chaps[id].url)
            let f_txt = await f_res.text()
            vm.selected_chaps[id].html = f_txt;
            vm.status_txt = "Parsing chapter content: " + id;
            let iframe: HTMLIFrameElement = document.getElementById("sandbox") as HTMLIFrameElement;
            iframe.contentWindow.postMessage({
              parser: JSON.stringify(vm.parsers),
              selparser: vm.parsedoc + "||chap_main_parser",
              doc: f_txt,
              id: id,
              url: vm.selected_chaps[id].url,
              url_title: vm.selected_chaps[id].url_title,
            }, '*');
          } else {
            // Is a single page book, no additional parsing needed.
          }
        } catch (e) {
          vm.status_txt = "Unable to parse content: " + e;
          console.log(e)
        }
        vm.progress_val += cnt_slice;
      }
      await Parallel.each(Array.from(Array(vm.selected_chaps.length).keys()), async id => {
        await extract_chap(id)
      }, 3);
    },
    edit_chap(chap: Chapter) {
      this.chap = chap;
      this.diag_show = true;
    },
    save_chap() {
      this.diag_show = false;
    },
    async gen_epub() {
      let vm = this;
      let nov_data: NovelData = {
        chapters: this.selected_chaps,
        title: vm.title,
        author: vm.author,
        publisher: vm.publisher,
        description: vm.description,
        filename: vm.title.toLowerCase().replaceAll(/[\W_]+/g, "_") + ".epub"
      };
      if (vm.cover != null) {
        let response = await fetch(vm.cover);
        if (response.ok) {
          nov_data.cover = await response.blob();
        }
      }
      await generate_epub(nov_data, function (msg: string) {
        vm.status_txt = msg
      });
    },
  }
});


</script>
