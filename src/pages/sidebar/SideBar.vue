<template>
  <div class="grid" style="width:100%">
    <div class="col-12">
      <span>{{ status_txt }}</span>
      <ProgressBar v-if="parse_progress>0" :value="parse_progress"
                   :show-value=false></ProgressBar>
      <div class="flex flex-wrap gap-3">
        Parse as:
        <div class="flex align-items-center">
          <RadioButton v-model="page_type" inputId="pages"
                       name="page_type" value="pages"/>
          <label for="pages" class="ml-2">Pages</label>
        </div>
        <div class="flex align-items-center">
          <RadioButton v-model="page_type" inputId="spa"
                       name="page_type" value="spa"/>
          <label for="spa" class="ml-2">App</label>
        </div>
      </div>
      <TabView>
        <TabPanel header="Overview">
          <ChapToolbar @add="add_chap" @parse="parse"
                       @epub="gen_epub" @delete="delete_chap"
                       @cache="cache" @load="load"
                       @export_csv="export_csv" @import_csv="import_csv"/>
          <DataTable :value="chaps"
                     ref="dt"
                     v-model:selection="selected_chaps"
                     @rowReorder="reorder($event)"
                     selectionMode="multiple"
                     :metaKeySelection="false"
                     scrollable scrollHeight="40vh"
                     class="p-datatable-sm mb-2"
                     responsiveLayout="scroll">
            <Column :rowReorder="true" headerStyle="width: 2rem" :reorderableColumn="false"/>
            <Column selectionMode="multiple" style="width: 2rem" :exportable="false"></Column>
            <Column field="html_parsed" header="Parsed" :exportable="false">
              <template #body="{data}:any">
                <i class="pi" :class="(!(data as any).html_parsed)?'pi-circle':'pi-check'"></i>
              </template>
            </Column>
            <Column field="id" header="#" sortable></Column>
            <Column field="title" header="Title" sortable></Column>
            <Column field="url" header="URL" sortable></Column>
          </DataTable>
          <TabView>
            <TabPanel header="Meta">
              <Meta/>
            </TabPanel>
            <TabPanel header="Chapter Text">
              <span v-if="selected_chaps.length==0">No chapter selected</span>
              <div v-if="selected_chaps.length>0" class="grid mt-2">
                <div class="col-6 p-float-label max-w-full">
                  <InputText id="chap_title" style="width:100%" size="small"
                             v-model="selected_chaps[selected_chaps.length-1].title"/>
                  <label for="chap_title">Title:</label>
                </div>
                <div class="col-6 p-float-label max-w-full">
                  <InputText id="chap_url" style="width:100%" size="small"
                             v-model="selected_chaps[selected_chaps.length-1].url"/>
                  <label for="chap_url">Url:</label>
                </div>
                <div class="col-12">
                  <iframe title="Preview"
                          :srcdoc="selected_chaps[selected_chaps.length-1].html_parsed || 'No data'"
                          style="border-width: 1px;width: 100%;height: 30vh;overflow: auto;"></iframe>
                </div>
              </div>
            </TabPanel>
            <TabPanel header="Links Parser">
              <LinksParse @parse_links="parse_links"/>
            </TabPanel>
            <TabPanel header="Chapter Parser">
              <TextParse/>
            </TabPanel>
            <TabPanel header="Add Page Parser">
              <NextParse/>
            </TabPanel>
          </TabView>
        </TabPanel>
        <TabPanel header="Parser Definition">
          <ParserDef/>
        </TabPanel>
        <TabPanel header="Logs">
          <div id="logs" style="white-space: pre;">
            {{ logs }}
          </div>
        </TabPanel>
      </TabView>

    </div>
  </div>
</template>

<script setup lang="ts">
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import ProgressBar from 'primevue/progressbar';
import DataTable from "primevue/datatable";
import Column from "primevue/column";

import {onMounted, Ref, ref} from "vue";
import {watchDebounced} from "@vueuse/core";
import Papa from 'papaparse';

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import ChapToolbar from "./overview/ChapToolbar.vue";
import Meta from "./overview/Meta.vue"
import ParserDef from "./parserconfig/ParserDef.vue";

import ParserManager from "../../services/scraping/ParserMan";
import SandboxInput from "../../services/messaging/SandboxInput";
import {MsgCommand} from "../../services/messaging/msg_types";
import {Chapter} from "../../services/novel/novel_data";


import {status_txt, logs, write_info} from "./sidebar_utils";
import {
  parsers,
  curr_parser_txt,
  curr_parse_doc,
  page_type,
  p_inputs_val_link,
  p_inputs_val_text,
  parser,
  parser_chap, threads, wait_s
} from "../parser_state"
import {meta, chaps, selected_chaps} from "../novel_state"
import {msg_sendwin, init_sidebarwin} from "../win_state"
import {run_epub, add} from "../proc_funcs"
import RadioButton from "primevue/radiobutton";
import LinksParse from "./parserconfig/LinksParse.vue";
import NextParse from "./parserconfig/AddPageParse.vue";
import TextParse from "./parserconfig/TextParse.vue";
import InputText from "primevue/inputtext";
import OptionsManager from "../../services/common/OptionsMan";


let parse_man: ParserManager

const dt = ref()

// Status tracking
const parse_cancel = ref<boolean>(false)
const parse_progress = ref<number>(0)

function reorder(reordered_chaps: Ref<Chapter[]>) {
  chaps.value = reordered_chaps.value
}

function export_csv() {
  dt.value.exportCSV()
}

async function import_csv(file: File) {
  const txt = await file.text()
  const csv_res = Papa.parse(txt.trimEnd(), {header: true})
  for (let i = 0; i < csv_res.data.length; i++) {
    const curr_row = csv_res.data[i] as Record<string, string>
    if (chaps.value.length > i) {
      chaps.value[i].title = curr_row['Title']
      chaps.value[i].url = curr_row['URL']
    } else {
      chaps.value.push({
        id: i,
        title: curr_row['Title'],
        url: curr_row['URL'],
        html: '',
        html_parsed: ''
      })
    }
  }
}

async function add_chap() {
  await add(parse_man, chaps, p_inputs_val_text, parser_chap)
}

async function parse() {
  console.log("Parsing chapters...", selected_chaps)
  console.log(parser_chap.value)
  await parse_man.parser_chaps(
      parser_chap.value!.doc, parser_chap.value!.parser,
      selected_chaps, threads.value, wait_s.value,
      parse_cancel, write_info, parse_progress)
}

async function parse_links(add: boolean) {
  let doc_info =
      await msg_sendwin.send_message<{}, { url: string; src: string }>({
        command: MsgCommand.ContGetSource,
        data: {}
      })
  const res = await parse_man.run_links_parse(
      {
        inputs: p_inputs_val_link.value,
        url: doc_info.data!.url,
        src: doc_info.data!.src
      },
      parser.value!.doc,
      parser.value!.parser
  )
  console.log(res.data!.chaps)
  write_info(res.message)
  if (add) {
    write_info("Adding links...")
    chaps.value = chaps.value.concat(res.data!.chaps)
  } else {
    chaps.value = res.data!.chaps
    selected_chaps.value = []
  }

}

async function gen_epub() {
  await run_epub(chaps, selected_chaps, meta)
}

function delete_chap() {
  chaps.value = chaps.value.filter(val => !selected_chaps.value.includes(val));
  selected_chaps.value = [];
}

async function cache() {
  await OptionsManager.Instance.cache_state(chaps.value, meta.value)
  write_info("Cached chapters & meta data")
}

async function load() {
  const [chap, metares] = await OptionsManager.Instance.load_state()
  chaps.value = chap
  meta.value = metares
  write_info("Loaded cache")
}

onMounted(async () => {
  init_sidebarwin()

  new SandboxInput(document, window,
      async (this_sbx: SandboxInput) => {
        try {
          parse_man = new ParserManager(this_sbx)

          parsers.value = await parse_man.load_all_parsers()
          curr_parser_txt.value = parse_man.get_parse_docs()
          let doc_info =
              await msg_sendwin.send_message<{}, { url: string; src: string }>({
                command: MsgCommand.ContGetSource,
                data: {}
              })

          watchDebounced(
              curr_parser_txt,
              async () => {
                const doc = curr_parse_doc.value
                parsers.value[doc] = await parse_man.load_parser(doc, curr_parser_txt.value[doc])
                write_info("Parsers (re)loaded: " + new Date().toLocaleTimeString())
              },
              {deep: true, debounce: 1000, maxWait: 10000},
          )
          await parse_man.run_init_parser(
              doc_info.data!.url, doc_info.data!.src, curr_parse_doc.value)
        } catch (e) {
          if (typeof e === "string") {
            write_info(e)
          } else if (e instanceof Error) {
            console.error(e)
            write_info(e.message)
          }
        }
      })
})

</script>
