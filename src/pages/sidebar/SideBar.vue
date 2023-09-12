<template>
  <div class="grid" style="width:100%">
    <div class="col-12">
      <span>{{ status_txt }}</span>
      <Toolbar>
        <template #end>
          <Button label="Parse" @click="parse" class="mr-2" size="small"/>
          <Button label="Epub" @click="run_epub" icon="pi pi-book" size="small"/>
        </template>
      </Toolbar>
      <Chaps/>
      <TabView>
        <TabPanel header="Info">
          <Meta/>
        </TabPanel>
        <TabPanel header="Preview">
          <Preview/>
        </TabPanel>
        <TabPanel header="Parsing">
          <Parsing/>
        </TabPanel>
        <TabPanel header="Log">
          <div id="log" style="overflow:auto">
            {{ logmsgs }}
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang="ts">
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import Button from "primevue/button";
import Toolbar from "primevue/toolbar";

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import browser from "webextension-polyfill";
import {onMounted, ref} from "vue";

import Chaps from "./parts/Chaps.vue"
import Preview from "./parts/Preview.vue"
import Meta from "./parts/Meta.vue"
import Parsing from "./parts/Parsing.vue";

import ParserManager from "../../services/scraping/ParserMan";
import MsgWindow from "../../services/messaging/MsgWindow";
import {MsgCommand, MsgOut} from "../../services/messaging/msg_types";
import {chaps, meta, selected_chaps} from "./sidebar_state"

import {NovelData} from "../../services/novel/novel_data";
import {generate_epub} from "../../services/novel/epub_generator";


const status_txt = ref<string>('Loading')
const logmsgs = ref<string>("")
const parse_cancel = ref<boolean>(false)
const parse_progress = ref<number>(0)

const sb_origin = window.location.href
    .split("?", 2)[1]
    .split("=", 2)[1]
const parse_man = new ParserManager(document, window)
const msg_win = new MsgWindow(window, sb_origin,
    window.parent)

onMounted(async () => {
  await parse_man.load_parsers()
  const doc_info: MsgOut<{ url: string; src: string }> =
      await msg_win.send_message<{}, { url: string; src: string }>({
        command: MsgCommand.ContGetSource,
        data: {}
      })
  const init_res = await parse_man.run_init_parser(
      {
        inputs: {},
        url: doc_info.data!.url,
        src: doc_info.data!.src
      }
  )
  status_txt.value = init_res.message
  chaps.value = init_res.data!.chaps
  meta.value = init_res.data!.meta
})

async function parse() {
  console.log("Parsing chapters...", selected_chaps)
  await parse_man.parser_chaps(selected_chaps,
      parse_cancel, status_txt, parse_progress)
}

async function run_epub() {
  let epub_chaps = []
  for (let c of chaps.value) {
    if (selected_chaps.value.includes(c)) {
      epub_chaps.push(c)
    }
  }
  let nov_data: NovelData = {
    meta: meta.value,
    chapters: epub_chaps,
    filename: meta.value.title.toLowerCase().replace(/[\W_]+/g, "_") + ".epub"
  }
  if (meta.value.cover != null) {
    let response = await fetch(meta.value.cover);
    if (response.ok) {
      nov_data.cover = await response.blob();
    }
  }
  const filecontent = await generate_epub(nov_data, (msg: string) => {
    status_txt.value = msg
  })
  if (filecontent === undefined) {
    status_txt.value = "No file generated."
    return
  }
  await browser.downloads.download({
    url: URL.createObjectURL(filecontent),
    filename: nov_data.filename,
  });
}

</script>
