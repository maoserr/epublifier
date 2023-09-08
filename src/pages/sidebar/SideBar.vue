<template>
  <div class="grid" style="width:100%">
    <div class="col-12">
      <span>{{ status_txt }}</span>
      <Toolbar>
        <template #end>
          <Button label="Parse" @click="parse" class="mr-2" size="small"/>
          <Button label="Epub" @click="load_main" icon="pi pi-book" size="small"/>
        </template>
      </Toolbar>
      <TabView>
        <TabPanel header="Preview">

        </TabPanel>
        <TabPanel header="Parsing">

        </TabPanel>
        <TabPanel header="Log">
          <div id="log" style="overflow:auto">
            {{ logmsgs }}
          </div>
        </TabPanel>
      </TabView>
      <Chaps/>

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

import {onMounted, ref} from "vue";

import ParserManager from "../../services/scraping/ParserMan";
import MsgWindow from "../../services/messaging/MsgWindow";
import {MsgCommand, MsgOut} from "../../services/messaging/msg_types";
import {chaps} from "./sidebar_state"

import Chaps from "./parts/Chaps.vue"

const status_txt = ref<string>('Loading')
const logmsgs = ref<string>("")

const sb_origin = window.location.href
    .split("?", 2)[1]
    .split("=", 2)[1]
const parse_man = new ParserManager(document, window)
const msg_win = new MsgWindow(document, window,
    window.parent, sb_origin)

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
  console.log(init_res)
})

</script>
