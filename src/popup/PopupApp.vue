<template>
  <div class="grid">
    <div class="col-12">
      <Message :closable=false>{{ status_txt }}
      </Message>
    </div>
    <div class="col-12">
      <div style="float:right" class="flex gap-2">
        <Button label="Load as Chap" @click="setup_main(false, chaps, meta, parser!)"
                v-tooltip="'Treat this as the first chapter, for JS heavy pages'"
                icon="pi pi-file"/>
        <Button label="Load as TOC" @click="setup_main(true, chaps, meta, parser!)"
                v-tooltip="'Load list of chapters to parse multiple chapters'"
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
          <PopupParser :src="src" :url="url" @reparsed="set_parse_result"/>
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
import {Chapter, ChapterMeta, NovelMetaData} from "../common/novel_data";
import {
  ParserResultChap,
  ParserResultInit
} from "../common/parser_types";
import PopupMeta from "./PopupMeta.vue";
import PopupChaps from "./PopupChaps.vue";
import PopupParser from "./PopupParser.vue";

import {parser, status_txt} from "./popup_state";

// App data
const url = ref("N/A")
const src = ref('')

// Novel data
const meta = ref({title: 'N/A', description: 'N/A'} as NovelMetaData)
const chaps = ref([] as Chapter[])

function set_parse_result(type: 'toc' | 'chap',
                          pres: ParserResultInit | ParserResultChap) {
  if (type === 'toc') {
    const toc_res = pres as ParserResultInit
    meta.value = toc_res.meta
    chaps.value = toc_res.chaps.map((x:ChapterMeta)=>{
      return {
        info: {
          title: x.title,
          url: x.url,
          parser: x.parser,
          parse_doc: parser.value!.parse_doc
        },
        title: x.title,
        html: '',
        html_parsed: ''
      }
    })
  } else {
    const chap_res = pres as ParserResultChap
    if (chap_res.meta !== undefined) {
      meta.value = chap_res.meta
    }
    chaps.value = [{
      info: {
        title: chap_res.title ?? "N/A",
        url: url.value,
        parser: parser.value?.parser ?? "Simple",
        parse_doc: parser.value!.parse_doc
      },
      title: chap_res.title ?? "N/A",
      html: src.value,
      html_parsed: chap_res.html,
    }]
  }
}

onMounted(async () => {
  try {
    // Source extraction
    const res = await extract_source()
    url.value = res.url
    src.value = res.source
    status_txt.value = "Source parsed."
  } catch (error) {
    status_txt.value = "Error: " +
        ((error instanceof Error) ? error.message : String(error))
  }
})
</script>

