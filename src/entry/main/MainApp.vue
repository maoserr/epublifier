<template>
  <div id="app">
    <Dialog header="Parser Edit" v-model:visible="diagparser_show" :modal="true" class="p-fluid">
      <div class="p-field">
        <TabView v-model:activeIndex="activePIndex">
          <TabPanel header="Parser">
            <ParserEditor
                :parser_obj="parsers"
                :parser="selectedParser"
                v-model:txt="parser_txt"
                @status="status_txt=$event"></ParserEditor>
          </TabPanel>
        </TabView>
      </div>
      <template #footer>
        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="save_options"/>
      </template>
    </Dialog>
    <Dialog header="Chapter Edit" v-model:visible="diag_show" :modal="true" class="p-fluid">
      <div class="p-field">
        <label for="title">Name</label>
        <InputText id="title" v-model.trim="chap.title" required="true" autofocus :class="{'p-invalid': !chap.title}"/>
        <small class="p-error" v-if="!chap.title">Title is required.</small>
      </div>
      <div class="p-field">
        <TabView v-model:activeIndex="activeIndex">
          <TabPanel header="Preview">
            <iframe :srcdoc="chap.html_parsed" width="900px" height="600px"></iframe>
          </TabPanel>
          <TabPanel header="Parsed Source">
            <label for="innerhtml">Parsed HTML</label>
            <Textarea id="innerhtml" v-model="chap.html_parsed" required="true" rows="30" cols="150"/>
          </TabPanel>
          <TabPanel header="Full Source">
            <label for="allhtml">Full HTML</label>
            <Textarea id="allhtml" v-model="chap.html" required="true" rows="30" cols="150" disabled="disabled"/>
          </TabPanel>
        </TabView>
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
      <div class="p-field p-col-3">
        <Button icon="pi pi-times" class="p-button-danger" label="Delete Selected" @click="deleteSel($event)"
                :disabled="btn_disabled"/>
      </div>
      <div class="p-field p-col-2">
        <ParserSelector
            :chap_only="true"
            :parser_obj="parsers"
            v-model="selectedParser"></ParserSelector>
      </div>
      <div class="p-field p-col-2">
        <Button class="p-button-info" label="Set Parser" @click="setParser"
                :disabled="btn_disabled"/>
      </div>
      <div class="p-field p-col-2">
        <Button icon="pi pi-user-edit" class="p-button-info" label="Edit Parser" @click="edit_parser"/>
      </div>
      <div class="p-field p-col-3">
        <Button icon="pi pi-external-link" class="p-button-info" label="Export CSV" @click="exportCSV"/>
      </div>
      <div class="p-field p-col-12">
        <DataTable :value="chapts"
                   ref="dt"
                   v-model:selection="selected_chaps"
                   :reorderableColumns="true"
                   @rowReorder="onRowReorder"
                   selectionMode="multiple"
                   :metaKeySelection="false"
                   scrollable scrollHeight="500px"
                   :paginator="true" :rows="100"
                   class="p-datatable-sm"
                   paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                   :rowsPerPageOptions="[100, 200,500]"
                   responsiveLayout="scroll"
                   currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <Column :rowReorder="true" headerStyle="width: 3rem" :reorderableColumn="false"/>
          <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
          <Column field="url_title" header="URL Title" :sortable="true"></Column>
          <Column field="url" header="URL" :sortable="true">
            <template #body="slotProps">
              <a :href="slotProps.data.url" target="_blank" rel="noopener noreferrer">{{ slotProps.data.url }}</a>
            </template>
          </Column>
          <Column field="parser" header="Parser">
            <template #body="slotProps">
              {{ slotProps.data.parser ? slotProps.data.parser : "Auto" }}
            </template>
          </Column>
          <Column field="title" header="Parsed Title" :sortable="true"></Column>
          <Column :exportable="false" style="min-width:8rem" header="Edit Content">
            <template #body="slotProps">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-sm"
                      @click="edit_chap(slotProps.data)" :disabled='slotProps.data.html_parsed?null:"disabled"'/>
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="p-field p-col-12">
        <Message :closable="false">{{ status_txt }}</Message>
        <ProgressBar :value="progress_val" :showValue="true" style="height: .5em"/>
      </div>
      <div class="p-field p-col-6">
        <Button label="Extract Chapters" class="p-button-success" @click="extract_chaps()" :disabled="btn_disabled"/>
      </div>
      <div class="p-field p-col-6">
        <Button label="Compile Epub" class="p-button-success" @click="gen_epub()" :disabled="btn_comp_disabled"/>
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
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import * as Parallel from 'async-parallel';
import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

import {NovelData, Chapter} from "../../common/novel_data";
import {generate_epub} from "../../common/epub_generator";
import {load_parsers, save_parsers} from "../../common/parser_loader";

import NovelMetadata from "../../components/NovelMetadata.vue";
import ParserSelector from "../../components/ParserSelector.vue";
import ParserEditor from "../../components/ParserEditor.vue";

export default defineComponent({
  name: 'App',
  components: {
    NovelMetadata,
    ParserSelector,
    ParserEditor,
    Message,
    DataTable,
    Column,
    ColumnGroup,
    Button,
    ProgressBar,
    Dialog,
    Textarea,
    InputText,
    TabView,
    TabPanel
  },
  data() {
    return {
      activeIndex: 0,
      activePIndex: 0,
      status_txt: "",
      progress_val: 0,
      title: "Epublifier",
      publisher: "",
      author: "",
      cover: "",
      description: "",
      chap: {} as Chapter,
      selected_chaps: [] as Chapter[],
      chapts: null as Chapter[],
      parsers: null,
      selectedParser: null,
      parser_txt: "",
      diag_show: false,
      diagparser_show: false,
      diag_tab: 0,
      parsedoc: "",
    }
  },
  computed: {
    btn_disabled(): string {
      return this.selected_chaps.length == 0 ? "disabled" : null;
    },
    btn_comp_disabled(): string {
      if (this.selected_chaps.length == 0) {
        return "disabled";
      }
      for (let c in this.selected_chaps) {
        if (!this.selected_chaps[c].html_parsed) {
          return "disabled"
        }
      }
      return null;
    }
  },
  created() {
    if ("runtime" in browser && "onMessage" in browser.runtime) {
      browser.runtime.onMessage.addListener(this.msg_func);
    }
  },
  async mounted() {
    let vm = this;
    this.parsers = await load_parsers();
    this.selectedParser = "main||chap_main_parser";
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
  watch: {
    status_txt(newtxt) {
      console.log("Status:", newtxt)
    }
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
    deleteSel() {
      this.chapts = this.chapts.filter(val => !this.selected_chaps.includes(val));
      this.selected_chaps = [];
    },
    setParser() {
      for (let i in this.selected_chaps) {
        if (this.selectedParser == "main||chap_main_parser") {
          this.selected_chaps[i].parser = null
        } else {
          this.selected_chaps[i].parser = this.selectedParser
        }
      }
    },
    exportCSV() {
      let adt = this.$refs.dt as any;
      adt.exportCSV();
    },
    onRowReorder(event) {
      this.chapts = event.value;
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
              selparser: vm.selected_chaps[id].parser ? vm.selected_chaps[id].parser : vm.parsedoc + "||chap_main_parser",
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
    edit_parser() {
      this.diagparser_show = true;
    },
    async save_options() {
      if (this.selectedParser == null) {
        return
      }
      let p_sp = this.selectedParser.split("||");
      let pdoc = p_sp[0];
      let pcat = p_sp[1];
      let pars = null;
      if (p_sp.length > 2) {
        pars = p_sp[2];
      }
      let save_msg
      if ((pcat == "main_parser") || (pcat == "chap_main_parser")) {
        this.parsers[pdoc][pcat] = this.parser_txt;
        save_msg = `Parser saved: ${pdoc} - ${pcat}`
      } else if ((pcat == "toc_parsers") || (pcat == "chap_parsers")) {
        this.parsers[pdoc][pcat][pars]["code"] = this.parser_txt;
        save_msg = `Parser saved: ${pdoc} - ${pcat} - ${pars}`
      }
      await save_parsers(this.parsers);
      this.status_txt = save_msg;
      this.diagparser_show = false;
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
