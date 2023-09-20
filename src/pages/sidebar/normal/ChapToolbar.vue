<script setup lang="ts">

import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import Menu from 'primevue/menu';

import browser from "webextension-polyfill";
import {ref} from "vue";
import {chaps, selected_chaps} from "../sidebar_state";
import {get_origin, parse, run_epub} from "../sidebar_parsing";

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
        cmd:"report",
        origin:get_origin()
      })
    }
  }
]);
const toggle = (event: any) => {
  menu_bar.value.toggle(event);
};

function delete_chap() {
  chaps.value = chaps.value.filter(val => !selected_chaps.value.includes(val));
  selected_chaps.value = [];
}

</script>

<template>
  <Toolbar>
    <template #start>
      <Button v-tooltip:a.bottom="'Parse'" @click="parse" icon="pi pi-play" class="mr-2" size="small"/>
      <Button v-tooltip:a.bottom="'Epub'" @click="run_epub" icon="pi pi-book" severity="success" class="mr-2"
              size="small"/>
      <Button v-tooltip:a.bottom="'Delete'" @click="delete_chap" icon="pi pi-trash" severity="warning"
              size="small"/>
    </template>
    <template #end>
      <Button type="button" v-tooltip:a.bottom="'More'" icon="pi pi-ellipsis-v" @click="toggle"
              severity="secondary" size="small"
              aria-haspopup="true" aria-controls="overlay_menu"/>
      <Menu ref="menu_bar" id="overlay_menu" :model="items" :popup="true"/>
    </template>
    <Menu ref="menu_bar" id="overlay_menu" :model="items" :popup="true"/>
  </Toolbar>
</template>
