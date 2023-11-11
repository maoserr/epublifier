<template>
  <div class="grid" style="width:100%">
    <div class="col-12">
      <span>{{ status_txt }}</span>
      <ProgressBar v-if="parse_progress>0" :value="parse_progress"
                   :show-value=false></ProgressBar>
      <div class="flex flex-wrap gap-3">
        Parse as:
        <div class="flex align-items-center">
          <RadioButton v-model="page_type" inputId="regular"
                       name="page_type" value="regular"/>
          <label for="regular" class="ml-2">Pages</label>
        </div>
        <div class="flex align-items-center">
          <RadioButton v-model="page_type" inputId="spa"
                       name="page_type" value="spa"/>
          <label for="spa" class="ml-2">App</label>
        </div>
      </div>
      <TabView>
        <TabPanel header="Overview">
          <ChapToolbar @add="add" @parse="parse"
                       @epub="gen_epub" @delete="delete_chap"/>
          <DataTable :value="chaps"
                     v-model:selection="selected_chaps"
                     @rowReorder="reorder($event)"
                     selectionMode="multiple"
                     :metaKeySelection="false"
                     scrollable scrollHeight="40vh"
                     class="p-datatable-sm"
                     responsiveLayout="scroll">
            <Column :rowReorder="true" headerStyle="width: 2rem" :reorderableColumn="false"/>
            <Column selectionMode="multiple" style="width: 2rem" :exportable="false"></Column>
            <Column field="html_parsed" header="Parsed">
              <template #body="{data}:any">
                <i class="pi" :class="(!(data as any).html_parsed)?'pi-circle':'pi-check'"></i>
              </template>
            </Column>
            <Column field="title" header="Title"></Column>
          </DataTable>
          <TabView>
            <TabPanel header="Meta">
              <Meta/>
            </TabPanel>
            <TabPanel header="Chapter Text">
              <iframe title="Preview"
                      :srcdoc="selected_chaps[selected_chaps.length-1]?.html_parsed || 'No data'"
                      style="border-width: 1px;width: 100%;height: 30vh;overflow: auto;"></iframe>
            </TabPanel>
            <TabPanel header="Link Parser">
              <LinksParse/>
            </TabPanel>
            <TabPanel header="Add Page Parser">
              <NextParse/>
            </TabPanel>
            <TabPanel header="Chapter Parser">
              <TextParse/>
            </TabPanel>
          </TabView>
        </TabPanel>
        <TabPanel header="Parser Definition">
          <ParserDef />
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

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import ChapToolbar from "./overview/ChapToolbar.vue";
import Meta from "./overview/Meta.vue"
import ParserDef from "./parserconfig/ParserDef.vue";

import ParserManager from "../../services/scraping/ParserMan";
import SandboxInput from "../../services/messaging/SandboxInput";
import {MsgCommand, MsgOut} from "../../services/messaging/msg_types";
import {Chapter} from "../../services/novel/novel_data";


import {status_txt, logs, write_info} from "./sidebar_utils";
import {parsers, curr_parser_txt, curr_parse_doc, page_type} from "../parser_state"
import {meta, chaps, selected_chaps} from "../novel_state"
import {msg_sendwin, init_sidebarwin} from "../win_state"
import {run_epub} from "../proc_funcs"
import RadioButton from "primevue/radiobutton";
import LinksParse from "./parserconfig/LinksParse.vue";
import NextParse from "./parserconfig/AddPageParse.vue";
import TextParse from "./parserconfig/TextParse.vue";


let parse_man: ParserManager

// Status tracking
const parse_cancel = ref<boolean>(false)
const parse_progress = ref<number>(0)

function reorder(reordered_chaps: Ref<Chapter[]>) {
  chaps.value = reordered_chaps.value
}

async function add() {
  console.log("Adding chapter...")
}

async function parse() {
  console.log("Parsing chapters...", selected_chaps)
  await parse_man.parser_chaps(selected_chaps,
      parse_cancel, write_info, parse_progress)
}

async function gen_epub() {
  await run_epub(chaps,selected_chaps,meta)
}

function delete_chap() {
  chaps.value = chaps.value.filter(val => !selected_chaps.value.includes(val));
  selected_chaps.value = [];
}

onMounted(async () => {
  init_sidebarwin()

  new SandboxInput(document, window,
      async (this_sbx: SandboxInput) => {
        parse_man = new ParserManager(this_sbx)

        parsers.value = await parse_man.load_all_parsers()
        curr_parser_txt.value = parse_man.get_parse_docs()
        const doc_info: MsgOut<{ url: string; src: string }> =
            await msg_sendwin.send_message<{}, { url: string; src: string }>({
              command: MsgCommand.ContGetSource,
              data: {}
            })
        const init_res = await parse_man.run_init_parser(
            doc_info.data!.url, doc_info.data!.src, curr_parse_doc.value)
        write_info(init_res.message)
        chaps.value = init_res.data!.chaps
        meta.value = init_res.data!.detected.meta

        watchDebounced(
            curr_parser_txt,
            async () => {
              const doc = curr_parse_doc.value
              parsers.value[doc] = await parse_man.load_parser(doc, curr_parser_txt.value[doc])
              write_info("Parsers (re)loaded: " + new Date().toLocaleTimeString())
            },
            {deep: true, debounce: 1000, maxWait: 10000},
        )
      })
})

</script>
