<script setup lang="ts">

import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import Menu from 'primevue/menu';

import browser from "webextension-polyfill";
import {ref} from "vue";
import {get_origin} from "../../../services/dom/SidebarContainer";

defineEmits<{
  add: [],
  parse: [],
  epub: [],
  delete: []
}>()

const menu_bar = ref();
const items = ref([
  {
    label: 'Editor',
    icon: 'pi pi-file-edit',
    command: () => {

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
  }
]);

const toggle = (event: any) => {
  menu_bar.value.toggle(event);
};
</script>

<template>
  <Toolbar>
    <template #start>
      <Button v-tooltip:a.bottom="'Parse selected links'"
              @click="$emit('parse')"
              icon="pi pi-play" class="mr-2" size="small"/>
      <Button v-tooltip:a.bottom="'Add This Page \n& Next Chapter(s)'"
              @click="$emit('add')"
              icon="pi pi-plus-circle" class="mr-2" size="small"/>
      <Button v-tooltip:a.bottom="'Create Epub'"
              @click="$emit('epub')"
              icon="pi pi-book" severity="success" class="mr-2"
              size="small"/>
      <Button v-tooltip:a.bottom="'Delete selected chapters'"
              @click="$emit('delete')"
              icon="pi pi-trash" severity="warning"
              size="small"/>
    </template>
    <template #end>
      <Button type="button" v-tooltip:a.bottom="'More'" icon="pi pi-ellipsis-v" @click="toggle"
              severity="secondary" size="small"
              aria-haspopup="true" aria-controls="overlay_menu"/>
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
