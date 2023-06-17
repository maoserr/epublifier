<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import ProgressBar from "primevue/progressbar";

import {ref, computed} from "vue";

import {
  chaps,
  epub_gen,
  meta,
  selected_chaps,
  running,
  status_txt,
  progress, cancel
} from "./main_state";
import {compile_epub, parse_chaps} from "./parse_main";
import MainEditor from "./MainEditor.vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";

const dt = ref()
const parse_label = computed(() => {
  if (running.value) {
    return "Cancel"
  }
  return "Parse"
})
const parse_disable = computed(() => {
  return selected_chaps.value.length == 0
})
const epub_disable = computed(() => {
  if (running.value) {
    return true
  }
  if (epub_gen.value) {
    return true
  }
  if (selected_chaps.value.length == 0)
    return true
  for (let c in selected_chaps.value) {
    if (!selected_chaps.value[c].html_parsed)
      return true
  }
  return false
})

async function run_epub() {
  if (epub_gen.value) {
    return
  }
  epub_gen.value = true
  await compile_epub(meta.value, selected_chaps.value, status_txt)
  epub_gen.value = false
}

async function run_print(){
  let mywindow = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150')!;

  mywindow.document.write(`<html><head><title>${meta.value.title}</title>`);
  mywindow.document.write('</head><body >');
  mywindow.document.write(`<h1>${meta.value?.title}</h1>`)
  if (meta.value.cover !== undefined){
    mywindow.document.write(`<img src='${meta.value.cover}'/><br/>`)
  }
  mywindow.document.write(`Author: ${meta.value?.author}<br/>`)
  mywindow.document.write(`${meta.value?.description}<br/>`)
  for (let c of selected_chaps.value){
    mywindow.document.write(`<h2>${c.title}</h2>`)
    mywindow.document.write(c.html_parsed);
  }
  mywindow.document.write('</body></html>');
  mywindow.document.close(); // necessary for IE >= 10
  mywindow.focus(); // necessary for IE >= 10*/
  mywindow.addEventListener('load', (event:any)=>{mywindow.print()})
}

async function run_parsers() {
  if (running.value) {
    cancel.value = true
  } else {
    console.log("Parsing...")
    running.value = true
    await parse_chaps(selected_chaps.value, meta.value, cancel, status_txt, progress)
    running.value = false
    cancel.value = false
  }
}

function onDelete(event: any) {
  chaps.value = chaps.value.filter(val => !selected_chaps.value.includes(val));
  selected_chaps.value = [];
}
</script>

<template>
  <Toolbar>
    <template #start>
      <Button label="New" icon="pi pi-plus" class="mr-2" rounded raised/>
      <Button icon="pi pi-times" @click="onDelete" class="mr-2" severity="danger" rounded raised/>
      <Button label="CSV" @click="$refs.dt.exportCSV()" icon="pi pi-download" rounded raised/>
    </template>

    <template #end>
      <Button :label="parse_label" icon="pi pi-play" class="mr-2"
              @click="run_parsers" :disabled="parse_disable" rounded raised/>
      <Button label="Print" icon="pi pi-print" class="mr-2" severity="success"
              @click="run_print" :disabled="epub_disable" rounded raised/>
      <Button label="Epub" icon="pi pi-download" severity="success"
              @click="run_epub" :disabled="epub_disable" rounded raised/>
    </template>
  </Toolbar>
  <ProgressBar :value="progress" :show-value="false"></ProgressBar>
  <TabView>
    <TabPanel header="Chapters">
      <DataTable :value="chaps" ref="dt"
                 v-model:selection="selected_chaps"
                 :reorderableColumns="true"
                 @rowReorder="chaps = $event.value"
                 selectionMode="multiple"
                 scrollable scrollHeight="60vh"
                 :paginator="true" :rows="100"
                 class="p-datatable-sm"
                 :rowsPerPageOptions="[100, 200,500]"
                 responsiveLayout="scroll">
        <Column :rowReorder="true" headerStyle="width: 3rem" :exportable="false" :reorderableColumn="false"/>
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="title" header="Title" :sortable="true"></Column>
        <Column field="info.url" header="URL" :sortable="true">
          <template #body="{data}:any">
            <a :href="(data as any).info.url" target="_blank" rel="noopener noreferrer">
              {{ (data as any).info.url?.slice(0, 25) }}...</a>
          </template>
        </Column>
        <Column field="html_parsed" header="Parsed">
          <template #body="{data}:any">
            <i class="pi" :class="(!(data as any).html_parsed)?'pi-circle':'pi-check'"></i>
          </template>
        </Column>
      </DataTable>
    </TabPanel>
    <TabPanel header="Parser">
      <MainEditor/>
    </TabPanel>
  </TabView>
</template>
