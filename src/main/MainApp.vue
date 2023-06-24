<template>
  <div class="grid" style="width:100%">
    <div class="col-12">
      <Message :closable=false>{{ status_txt }}
      </Message>
    </div>
    <div class="col-6">
      <TabView>
        <TabPanel header="Metadata">
          <MainMeta/>
        </TabPanel>
        <TabPanel header="Preview Chap">
          <iframe :srcdoc="selected_chaps[0]?.html_parsed || 'No data'"
                  class="preview" title="Preview"></iframe>
        </TabPanel>
        <TabPanel header="Edit Chap">
          <span v-if="selected_chaps.length==0">No chapter selected</span>
          <div v-if="selected_chaps.length>0" class="grid">
            <div class="field col-12">
              <span class="p-float-label">
                <InputText class="w-full" id="chap_title" v-model="selected_chaps[0].title"></InputText>
                <label for="chap_title">Title:</label>
              </span>
            </div>
            <div class="field col-12">
              <span class="p-float-label">
                <InputText class="w-full" id="chap_url" v-model="selected_chaps[0].info.url"></InputText>
                <label for="chap_url">Url:</label>
              </span>
            </div>
            <div class="field col-12">
            <Textarea v-model="selected_chaps[0].html_parsed"
                      style="width: 100%; max-width: 100%; height: 70vh"/>
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Original Chap">
          <iframe :srcdoc="selected_chaps[0]?.html || 'No data'" class="preview" title="Preview"></iframe>
        </TabPanel>
      </TabView>
    </div>
    <div class="col-6">
      <MainChaps/>
    </div>
  </div>
</template>

<style>
.preview {
  border-width: 1px;
  width: 100%;
  height: 75vh;
  overflow: auto;
}
</style>

<script setup lang="ts">
import Message from "primevue/message";
import InputText from 'primevue/inputtext';
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Textarea from "primevue/textarea";


import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {onMounted} from 'vue'
import {watchDebounced} from '@vueuse/core'
import browser from "webextension-polyfill";

import {addSandboxListener} from "./parse_main"
import {get_parsers_definitions} from "../common/parser_manager";
import {SendSandboxCmdWReply} from "../sandboxed/send_message";
import {SbxCommand} from "../sandboxed/messages";

import {
  meta,
  chaps,
  selected_chaps,
  status_txt,
  parser_txt
} from "./main_state"
import MainMeta from "./MainMeta.vue";
import MainChaps from "./MainChaps.vue";

async function onLoadGetChapters() {
  const load_config = await browser.storage.local.get('last_parse')
  const last_parse = load_config.last_parse
  chaps.value = JSON.parse(last_parse.chaps)
  meta.value = JSON.parse(last_parse.meta)
}

watchDebounced(
    parser_txt,
    async () => {
      await SendSandboxCmdWReply(SbxCommand.LoadParsers,
          parser_txt.value)
      status_txt.value = "Parsers (re)loaded: " + new Date().toLocaleTimeString()
    },
    {deep: true, debounce: 1000, maxWait: 10000},
)

onMounted(async () => {
  try {
    // Load initial chapters
    await onLoadGetChapters()
    // Load Parser
    parser_txt.value = await get_parsers_definitions()

    // Setup permanent message pipeline
    addSandboxListener(selected_chaps, status_txt);
    status_txt.value = "Loaded."
  } catch (error) {
    status_txt.value = "Error: " +
        ((error instanceof Error) ? error.message : String(error))
  }
})
</script>
