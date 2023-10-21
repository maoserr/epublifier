<script setup lang="ts">
import {meta, write_info} from "../sidebar_state"
import InputText from "primevue/inputtext";
import Button from "primevue/button";

async function paste_cover() {
  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      console.log(clipboardItem)
      for (const type of clipboardItem.types) {
        console.log(type)
        if (type.startsWith("image/")) {
          const blob = await clipboardItem.getType(type);
          meta.value.cover = URL.createObjectURL(blob)
          return
        }
      }
    }
    write_info("No image in clipboard!")
  } catch (err: any) {
    console.error(err.name, err.message);
  }
}
</script>

<template>
  <div class="flex flex-column gap-4">
    <div class="p-float-label max-w-full">
      <InputText id="title" style="width:100%" class="" size="small" v-model="meta.title"/>
      <label for="title">Title:</label>
    </div>
    <div class="p-float-label max-w-full">
      <InputText id="author" style="width:100%" size="small" v-model="meta.author"/>
      <label for="author">Author:</label>
    </div>
  </div>
  <div id="coverdiv">
    <img v-if="meta?.cover" id="cover" :src="meta?.cover" alt="cover"/><br/>
    <Button icon="pi pi-image"
            v-tooltip:a.right="'Paste image from clipboard'"
            size="small"
            @click="paste_cover"/>
  </div>
  <div v-html="meta?.description"></div>
</template>

<style>

#coverdiv {
  float: left;
  margin: 5px;
  text-align: center;
}

#cover {
  max-height: 200px;
  max-width: 100px;
  object-fit: contain;
}
</style>
