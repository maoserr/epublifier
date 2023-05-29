<template>
  <div class="grid">
    <div class="col-12">
      <Message :closable=false>{{ status_txt }}
      </Message>
    </div>
    <div class="col-12">
      <div style="float:right" class="flex gap-2">
        <Button label="Load Sidebar" @click="setup_main(false, chaps, meta, parser!)"
                :disabled="parser_type != 'chap'"
                icon="pi pi-file"/>
        <Button label="Load Chapters" @click="setup_main(true, chaps, meta, parser!)"
                :disabled="parser_type != 'toc'"
                icon="pi pi-book"/>
      </div>
    </div>
    <div class="col-12">
      <TabView>
        <TabPanel header="Metadata">
          <PopupMeta :url="url" :meta="meta"/>
        </TabPanel>
        <TabPanel header="Chapters">
          <PopupChaps :chaps="chaps"/>
        </TabPanel>
        <TabPanel header="Parsing">
          <PopupParser :parsers="parsers" @reparse="reparse"/>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<style>
html {
  width: 700px;
  min-height: 550px;
}
</style>

<script setup lang="ts">
import Message from 'primevue/message';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {onMounted, ref} from 'vue'
import {setup_main} from './message_main'
import {extract_source} from './source_extract'
import {SbxCommand, SbxResult} from "../sandboxed/messages";
import {SendSandboxCmdWReply} from "../sandboxed/send_message";
import {get_parsers_definitions} from "../common/parser_manager";
import {ChapterInfo, NovelMetaData} from "../common/novel_data";
import {
  ParserDocDef,
  ParserResultAuto,
  ParserResultChap,
  ParserResultToc
} from "../common/parser_types";
import PopupMeta from "./PopupMeta.vue";
import PopupChaps from "./PopupChaps.vue";
import PopupParser from "./PopupParser.vue";

import {parser} from "./popup_state";

// App data
const url = ref("N/A")
const status_txt = ref("Loading...")
const src = ref('')

// Novel data
const meta = ref({title: 'N/A', description: 'N/A'} as NovelMetaData)
const chaps = ref([] as ChapterInfo[])

const parser_type = ref()
const parsers = ref([] as ParserDocDef[])


function set_parse_result(type: 'toc' | 'chap',
                          pres: ParserResultToc | ParserResultChap) {
  parser_type.value = type
  if (type === 'toc') {
    const toc_res = pres as ParserResultToc
    meta.value = toc_res.meta
    chaps.value = toc_res.chaps
  } else {
    const chap_res = pres as ParserResultChap
    if (chap_res.meta !== undefined) {
      meta.value = chap_res.meta
    }
    chaps.value = [{
      title: meta.value.title,
      url: "N/A",
      parser: parser.value?.parser ?? "Simple",
      parse_doc: parser.value?.parse_doc ?? "default"
    }]
  }
}



async function setup_parser() {
  // Load Parser
  const parser_txt = await get_parsers_definitions()
  const parsedefs_rep: SbxResult<any> = await SendSandboxCmdWReply(
      SbxCommand.LoadParsers, parser_txt)
  status_txt.value = parsedefs_rep.message
  parsers.value = parsedefs_rep.data
}

async function reparse(p_inputs_val:Record<string, any>) {
  if (parser.value === undefined) {
    return
  }
  const curr_parser: ParserDocDef = parser.value!
  try {
    const pres = await SendSandboxCmdWReply(SbxCommand.ParseSource, {
      doc: curr_parser.parse_doc,
      type: curr_parser.type,
      parser: curr_parser.parser,
      params: {inputs: p_inputs_val, url: url.value, src: src.value}
    })
    status_txt.value = pres.message
    if (curr_parser.type === 'toc') {
      set_parse_result(curr_parser.type, pres.data as ParserResultToc)
    } else {
      set_parse_result(curr_parser.type, pres.data as ParserResultChap)
    }
  } catch (error) {
    status_txt.value = "Error: " +
        ((error instanceof Error) ? error.message : String(error))
  }
}

onMounted(async () => {
  try {
    // Source extraction
    const res = await extract_source()
    url.value = res.url
    src.value = res.source
    status_txt.value = "Source parsed."

    await setup_parser()

    // Run Parser
    const pres = await SendSandboxCmdWReply(SbxCommand.ParseSource,
        {inputs: {}, url: url.value, src: src.value})
    status_txt.value = pres.message
    const auto_res = pres.data as ParserResultAuto
    parser.value = parsers.value.filter(
        (x: ParserDocDef) =>
            (x.parse_doc == auto_res.parse_doc)
            && (x.parser == auto_res.parser)
            && (x.type = auto_res.type)
    )[0]

    set_parse_result(auto_res.type, auto_res.result)
  } catch (error) {
    status_txt.value = "Error: " +
        ((error instanceof Error) ? error.message : String(error))
  }
})
</script>

