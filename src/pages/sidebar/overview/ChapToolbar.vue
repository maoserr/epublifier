<script setup lang="ts">

import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import Menu from 'primevue/menu';

import browser from "webextension-polyfill";
import {computed, ref} from "vue";
import {get_origin} from "../../../services/dom/SidebarContainer";
import {selected_chaps} from "../../novel_state";

const emits = defineEmits<{
  add: [],
  parse: [],
  epub: [],
  delete: [],
  cache: [],
  load: [],
  export_csv: [],
  import_csv: [file:File]
}>()

const menu_bar = ref();
const file_up = ref();
const items = ref([
  {
    label: 'Export CSV',
    icon: 'pi pi-file-edit',
    command: () => {
      emits("export_csv")
    }
  },
  {
    label: 'Import CSV',
    icon: 'pi pi-file-edit',
    command: () => {
      file_up.value.click();
    }
  },
  {
    label: 'Help',
    icon: 'pi pi-question-circle',
    command: () => {
      window.open('https://github.com/maoserr/epublifier/wiki')
    }
  },
  {
    label: 'Report Issue',
    icon: 'pi pi-external-link',
    command: () => {
      browser.runtime.sendMessage({
        cmd: "report",
        origin: get_origin()
      })
    }
  },
  {
    label: 'Donate (Paypal)',
    icon: 'pi pi-dollar',
    command: () => {
      window.open('https://www.paypal.com/donate/?business=T4MWDBYTZBPJ4&no_recurring=0&currency_code=USD')
    }
  }
]);

const chap_op_disable = computed<boolean>(() => {
  return selected_chaps.value.length == 0;
})

const add_chap_disable = computed<boolean>(() => {
  return selected_chaps.value.length != 0
})

const epub_disable = computed<boolean>(() => {
  if (selected_chaps.value.length == 0) {
    return true
  }
  for (let chap of selected_chaps.value) {
    if (!chap.html_parsed) {
      return true
    }
  }
  return false
})

const toggle = (event: any) => {
  menu_bar.value.toggle(event);
};

const sel_file = (event: any) =>{
  if (file_up.value.files.length>0){
    emits('import_csv', file_up.value.files[0])
    file_up.value.value = ''
  }
}
</script>

<template>
  <Toolbar>
    <template #start>
      <Button v-tooltip:a.bottom="'Parse selected links'"
              :disabled="chap_op_disable"
              @click="$emit('parse')"
              icon="pi pi-play" class="mr-2" size="small"/>
      <Button v-tooltip:a.bottom="'Add This Page \n& Next Chapter(s)'"
              :disabled="add_chap_disable"
              @click="$emit('add')"
              icon="pi pi-plus-circle" class="mr-2" size="small"/>
      <Button v-tooltip:a.bottom="'Create Epub'"
              :disabled="epub_disable"
              @click="$emit('epub')"
              icon="pi pi-book" severity="success" class="mr-2"
              size="small"/>
      <Button v-tooltip:a.bottom="'Delete selected chapters'"
              :disabled="chap_op_disable"
              @click="$emit('delete')"
              icon="pi pi-trash" severity="warning" class="mr-2"
              size="small"/>
    </template>
    <template #end>
      <Button v-tooltip:a.bottom="'Cache current data'"
              @click="$emit('cache')"
              icon="pi pi-save" class="mr-2"
              size="small"/>
      <Button v-tooltip:a.bottom="'Load cache'"
              @click="$emit('load')"
              icon="pi pi-folder-open" class="mr-2"
              size="small"/>
      <Button type="button" v-tooltip:a.bottom="'More'" icon="pi pi-ellipsis-v" @click="toggle"
              severity="secondary" size="small"
              aria-haspopup="true" aria-controls="overlay_menu"/>
      <input
          type="file"
          id="csvUpload"
          accept="text/csv"
          ref="file_up"
          @change="sel_file"
          style="display:none"/>
      <Menu ref="menu_bar" id="overlay_menu" :model="items" :popup="true">
        <template #item="{ label, item, props }:any">
          <a v-bind="props.action">
            <span v-bind="props.icon"/>
            <span v-bind="props.label">{{ label }}</span>
          </a>
        </template>
      </Menu>
    </template>
  </Toolbar>
</template>
