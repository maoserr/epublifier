<template>
  <div id="app">
    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-col-12">
        <Message :closable="false">{{ status_txt }}</Message>
      </div>
      <div class="p-field p-col-12">
        <DataTable :value="chapts"
                   v-model:selection="selected_chaps"
                   :paginator="true" :rows="20"
                   paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                   :rowsPerPageOptions="[10,20,50]" responsiveLayout="scroll"
                   currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
          <Column field="content" header="Chapter" :sortable="true"></Column>
          <Column field="url" header="URL">
            <template #body="slotProps">
              <a :href="slotProps.data.url" target="_blank" rel="noopener noreferrer">{{ slotProps.data.url }}</a>
            </template>
          </Column>
          <Column field="html" header="HTML">
            <template #body="slotProps">
              {{ slotProps.data.html ? "Parsed":"" }}
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
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

import {generate_epub} from "../../common/epub_generator";
import {chap_parse} from "../../common/chap_parse";
import {NovelData, Chapter} from "../../common/novel_data";

export default defineComponent({
  name: 'App',
  components: {
    Message,
    DataTable,
    Column,
    ColumnGroup,
    Button
  },
  data() {
    return {
      status_txt: "",
      selected_chaps: null as Chapter[],
      chapts: null as Chapter[]
    }
  },
  mounted() {
    if ("runtime" in browser && "onMessage" in browser.runtime) {
      browser.runtime.onMessage.addListener(this.msg_func);
    }
  },
  methods: {
    msg_func(request: any, sender: any) {
      let vm = this;
      browser.runtime.onMessage.removeListener(this.msg_func);
      if (request.action == "newTabSource") {
        vm.chapts = request.data;
      }
    },
    extract_chaps() {
      let vm = this;
      let chap_fetches = [];
      for (let c in vm.selected_chaps) {
        chap_fetches.push(
            fetch(vm.chapts[c].url)
                .then(x => x.text())
                .then(x => {
                  vm.chapts[c].html = x;
                })
        );
      }
      Promise.all(chap_fetches).then(() => vm.status_txt="All selected chapters extracted.");
    },
    gen_epub() {
      // let compile_result = document.getElementById("compile_result");
      // for (let i in nov_data.chapters) {
      //   compile_result.innerHTML = "Compiling " + i;
      //   let chap = chap_parse(nov_data.chapters[i]);
      //   nov_data.chapter_parsed[nov_data.chapters[i].url] = chap;
      // }
      // generate_epub(nov_data, compile_result);
    },
  }
});


</script>
