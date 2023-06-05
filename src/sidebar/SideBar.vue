<template>
  <div class="grid" style="width:100%">
    <div class="col-12">
      <span>{{ status_txt }}</span>
      <Toolbar>
        <template #start>
          <Button label="Pick Next" @click="pick_next" class="mr-2"/>
        </template>
        <template #center>
          <Button icon="pi pi-times" @click="onDelete" class="mr-2" severity="danger" rounded raised/>
        </template>
        <template #end>
          <Button label="Parse" @click="parse" class="mr-2"/>
          <InputNumber v-model="max_chaps" id="maxchap" input-class="mr-2"
                       :input-style="{width: '4rem'}" :min="1"/>
          <Button label="Load" @click="load_main" icon="pi pi-book"/>
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
import Toolbar from "primevue/toolbar";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputNumber from 'primevue/inputnumber';

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {computed, ref} from "vue";
import {Chapter, ChapterInfo} from "../common/novel_data";
import {Readability} from "@mozilla/readability";

const status_txt = ref<string>('Loading')
const max_chaps = ref<number>(5)
const title = computed(() => {
  return selected_chaps.value[0]?.title ?? ""
})
const text = computed(() => {
  return selected_chaps.value[0]?.html_parsed ?? ""
})
const chaps = ref<Chapter[]>([])
const selected_chaps = ref<Chapter[]>([])

window.addEventListener('message', (evt: any) => {
  const data = evt.data
  switch (data.msg) {
    case 'PARSED_PAGE':
      let parser = new DOMParser();
      let dom = parser.parseFromString(data.source, "text/html");
      let out = new Readability(dom).parse()
      let title = out?.title ?? ""
      let text = out?.content ?? ""
      let chap = {
        info: {title: 'N/A', url: 'N/A', parser: 'N/A', parse_doc: 'N/A'} as ChapterInfo
        , title: title, html: data.source, html_parsed: text
      } as Chapter
      chaps.value.push(chap)
      selected_chaps.value = [chap]
      status_txt.value = `Parsed ${title}`
      max_chaps.value -= 1
      if (max_chaps.value > 0) {
          parse({})
      }
      break;
    case 'SELECTED_NEXT':
      status_txt.value = `Found ${data.els} clickable elements`
      break;
  }
})

function parse(evt: any) {
  window.parent.postMessage({
    msg: 'PARSE_PAGE'
  }, '*' as WindowPostMessageOptions)
}

function pick_next(evt: any) {
  window.parent.postMessage({
    msg: 'SELECT_NEXT'
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
