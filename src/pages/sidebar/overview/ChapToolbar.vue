<script setup lang="ts">

import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import Menu from 'primevue/menu';

import browser from "webextension-polyfill";
import {ref} from "vue";
import {chaps, meta, selected_chaps, write_info} from "../sidebar_state";
import {NovelData} from "../../../services/novel/novel_data";
import {generate_epub} from "../../../services/novel/epub_generator";
import {get_origin} from "../../../services/dom/SidebarContainer";
import {parse_man} from "../../../services/parser_state";

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

export async function parse() {
  console.log("Parsing chapters...", selected_chaps)
  await parse_man.parser_chaps(selected_chaps,
      parse_cancel, write_info, parse_progress)
}

export async function run_epub() {
  let epub_chaps = []
  for (let c of chaps.value) {
    if (selected_chaps.value.includes(c)) {
      epub_chaps.push(c)
    }
  }
  let nov_data: NovelData = {
    meta: meta.value,
    chapters: epub_chaps,
    filename: meta.value.title.toLowerCase().replace(/[\W_]+/g, "_") + ".epub"
  }
  if (meta.value.cover != null) {
    let response = await fetch(meta.value.cover);
    if (response.ok) {
      nov_data.cover = await response.blob();
    }
  }
  const filecontent = await generate_epub(nov_data, (msg: string) => {
    write_info(msg)
  })
  if (filecontent === undefined) {
    write_info("No file generated.")
    return
  }
  await browser.runtime.sendMessage(
      {
        cmd: "download",
        file: URL.createObjectURL(filecontent),
        filename: nov_data.filename
      }
  )
}


function delete_chap() {
  chaps.value = chaps.value.filter(val => !selected_chaps.value.includes(val));
  selected_chaps.value = [];
}

</script>

<template>
  <Toolbar>
    <template #start>
      <Button v-tooltip:a.bottom="'Add This Page'"
              @click="parse_man.parse_chaps_fetch()"
              icon="pi pi-plus-circle" class="mr-2" size="small"/>
      <Button v-tooltip:a.bottom="'Parse selected links'"
              @click="parse"
              icon="pi pi-play" class="mr-2" size="small"/>
      <Button v-tooltip:a.bottom="'Create Epub'"
              @click="run_epub"
              icon="pi pi-book" severity="success" class="mr-2"
              size="small"/>
      <Button v-tooltip:a.bottom="'Delete selected chapters'"
              @click="delete_chap"
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
            <span v-bind="props.icon" />
            <span v-bind="props.label">{{ label }}</span>
          </a>
        </template>
      </Menu>
    </template>
  </Toolbar>
</template>
