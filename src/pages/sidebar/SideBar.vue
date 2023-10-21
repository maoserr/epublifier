<template>
  <div class="grid" style="width:100%">
    <div class="col-12">
      <span>{{ status_txt }}</span>
      <ProgressBar v-if="parse_progress>0" :value="parse_progress"
                   :show-value=false></ProgressBar>
      <TabView>
        <TabPanel header="Overview">
          <ChapToolbar/>
          <ChapsList/>
          <TabView>
            <TabPanel header="Meta">
              <Meta/>
            </TabPanel>
            <TabPanel header="Chapter">
              <Preview/>
            </TabPanel>
          </TabView>
        </TabPanel>
        <TabPanel header="Parser Config">
          <TabView>
            <TabPanel header="Parse Options">
              <Parsing/>
            </TabPanel>
            <TabPanel header="Parser Definition">
              <Parser/>
            </TabPanel>
          </TabView>
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

import {onMounted} from "vue";

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import ChapsList from "./././overview/ChapsList.vue"
import Preview from "./././overview/Preview.vue"
import Meta from "./././overview/Meta.vue"
import Parsing from "././parserconfig/ParserOptions.vue";
import ChapToolbar from "././overview/ChapToolbar.vue";
import Parser from "././parserconfig/ParserCode.vue";

import {status_txt, logs, meta} from "./sidebar_state";
import MsgWindow from "../../services/messaging/MsgWindow";
import SandboxInput from "../../services/messaging/SandboxInput";
import {ref} from "vue/dist/vue";
import {init_parseman} from "../../services/parser_state";
import {get_origin} from "../../services/dom/SidebarContainer";

export let container_win: MsgWindow

export const parse_cancel = ref<boolean>(false)
export const parse_progress = ref<number>(0)

onMounted(async () => {
  const sb_origin = get_origin()
  container_win = new MsgWindow(window, sb_origin,
      window.parent)

  new SandboxInput(document, window,
      async (this_sbx: SandboxInput) => {
        await init_parseman(this_sbx, container_win)
      })
})

</script>
