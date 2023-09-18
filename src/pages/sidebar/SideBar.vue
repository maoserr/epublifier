<template>
  <div class="grid" style="width:100%">
    <div class="col-12">
      <span>{{ status_txt }}</span>
      <ProgressBar v-if="parse_progress>0" :value="parse_progress"></ProgressBar>
      <TabView>
        <TabPanel header="Overview">
          <ChapToolbar/>
          <ChapsList/>
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
          </TabView>
        </TabPanel>
        <TabPanel header="Advanced">
          <Parser/>
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

import ChapsList from "././normal/ChapsList.vue"
import Preview from "././normal/Preview.vue"
import Meta from "././normal/Meta.vue"
import Parsing from "././normal/Parsing.vue";
import ChapToolbar from "./normal/ChapToolbar.vue";
import Parser from "./advanced/Parser.vue";

import {status_txt, logs} from "./sidebar_state";
import {init_parsing, parse_progress} from "./sidebar_parsing";


onMounted(async () => {
  await init_parsing()
})

</script>
