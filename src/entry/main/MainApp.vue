<template>
  <div id="app">
    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-col-12">
        <DataTable :value="chapts" :paginator="true" :rows="10"
                   paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                   :rowsPerPageOptions="[10,20,50]" responsiveLayout="scroll"
                   currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <Column field="content" header="Chapter"></Column>
          <Column field="url" header="URL"></Column>
        </DataTable>
      </div>
      <div class="p-field p-col-12">
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
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {generate_epub} from "../../common/epub_generator";
import {chap_parse} from "../../common/chap_parse";
import {NovelData, Chapter, IndexData, PopupMsg} from "../../common/novel_data";
import {parse_toc_links} from "../../book_parser/toc_parser";

export default defineComponent({
  name: 'App',
  components: {
    DataTable,
    Column,
    ColumnGroup,
    Button
  },
  data() {
    return {
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
        let data: PopupMsg = request.data
        let ind_data: IndexData = request.data.ind_data
        vm.chapts = parse_toc_links(ind_data.source, ind_data.url);
      }
    },
    gen_epub() {
      let chapters = document.getElementById("chapters");
      let compile_epub = document.getElementById("compile_epub");
      let compile_result = document.getElementById("compile_result");
      let novdata = new NovelData();
      let metadata = document.getElementById("metadata");
      let inps = chapters.querySelectorAll("input");
      let request = new XMLHttpRequest();

      novdata.title = (<HTMLInputElement>(
          metadata.querySelector("#title")
      )).value;
      novdata.author = (<HTMLInputElement>(
          metadata.querySelector("#author")
      )).value;
      novdata.cover = (<HTMLInputElement>(
          metadata.querySelector("#cover")
      )).value;

      function loop(i: number, length: number, resultArr: NovelData) {
        if (i >= length) {
          this.parse_results(resultArr);
          return;
        }
        let url = inps[i].value;

        request.open("GET", url);
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
              resultArr.push({
                content: request.responseText,
                url: request.responseURL,
              });
              compile_result.innerHTML =
                  "Parsed chapter " +
                  i +
                  ", (" +
                  ((i / length) * 100).toFixed(1) +
                  "%) <br/>";
              loop(i + 1, length, resultArr);
            } else {
              compile_result.innerHTML =
                  "Invalid response " +
                  request.status +
                  " in chapter url: " +
                  inps[i].value;
            }
          }
        };
        request.send();
      }

      loop(0, inps.length, novdata);
    },
    parse_results(nov_data: NovelData) {
      let compile_result = document.getElementById("compile_result");
      for (let i in nov_data.chapters) {
        compile_result.innerHTML = "Compiling " + i;
        let chap = chap_parse(nov_data.chapters[i]);
        nov_data.chapter_parsed[nov_data.chapters[i].url] = chap;
      }
      generate_epub(nov_data, compile_result);
    }
  }
});


</script>
