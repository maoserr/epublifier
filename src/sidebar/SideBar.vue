<template>
  <div class="grid" style="width:100%">
    <div class="col-12">
      <Toolbar>
        <template #start>
          <Button label="Parse" @click="parse" class="mr-2"/>
          <Button icon="pi pi-times" @click="onDelete" class="mr-2" severity="danger" rounded raised/>
          <Button label="Load Chapters" @click="load_main" icon="pi pi-book"/>
        </template>
      </Toolbar>
      <TabView>
        <TabPanel header="Preview">
          <iframe title="Preview" :srcdoc="text"
                  style="border-width: 1px;width: 100%;height: 65vh;overflow: auto;"></iframe>
        </TabPanel>
        <TabPanel header="Chapters">
          <DataTable :value="chaps"
                     v-model:selection="selected_chaps"
                     @rowReorder="chaps = $event.value"
                     selectionMode="multiple"
                     scrollable scrollHeight="70vh"
                     class="p-datatable-sm"
                     responsiveLayout="scroll"
                     tableStyle="min-width: 50rem">
            <Column :rowReorder="true" headerStyle="width: 3rem" :exportable="false" :reorderableColumn="false"/>
            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="title" header="Title"></Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {ref} from "vue";
import {Readability} from "@mozilla/readability";
import {Chapter, ChapterInfo} from "../common/novel_data";
import Toolbar from "primevue/toolbar";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import Column from "primevue/column";
import DataTable from "primevue/datatable";

const title = ref<string>('')
const text = ref<string>('')
const chaps = ref<Chapter[]>([])
const selected_chaps = ref<Chapter[]>([])

window.addEventListener('message', (evt: any) => {
  const data = evt.data
  switch (data.msg) {
    case 'PARSED_PAGE':
      let parser = new DOMParser();
      let dom = parser.parseFromString(data.source, "text/html");
      let out = new Readability(dom).parse()
      text.value = out?.content ?? "";
      title.value = out?.title ?? "";
      chaps.value.push({
        info: {title: 'N/A', url: 'N/A', parser: 'N/A', parse_doc: 'N/A'} as ChapterInfo
        , title: title.value, html: data.source, html_parsed: text.value
      } as Chapter)
      break;
  }
})

function parse(evt: any) {
  window.parent.postMessage({
    msg: 'PARSE_PAGE'
  }, '*' as WindowPostMessageOptions)
}

function onDelete(event: any) {
  chaps.value = chaps.value.filter(val => !selected_chaps.value.includes(val));
  selected_chaps.value = [];
}

function load_main(evt: any) {
  window.parent.postMessage({
    msg: 'LOAD_MAIN',
    chaps: JSON.stringify(chaps.value),
    meta: JSON.stringify({title: 'N/A', description: 'N/A'})
  }, '*' as WindowPostMessageOptions)
}
</script>

<style>
html {
  font-size: 14px;
  padding: .5rem;
}

body {
  font-size: 14px;
  color: var(--text-color);
  background-color: var(--surface-card);
}
</style>
