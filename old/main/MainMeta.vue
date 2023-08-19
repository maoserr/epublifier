<script setup lang="ts">
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";

import {meta, status_txt} from "./main_state"
import Textarea from "primevue/textarea";

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
    status_txt.value = "No image in clipboard!"
  } catch (err: any) {
    console.error(err.name, err.message);
  }
}

</script>

<template>
  <div class="grid">
    <div class="field col-4">
      <label for="title">Title:</label>
      <InputText id="title" v-model="meta.title"/>
    </div>
    <div class="field col-4">
      <label for="author">Author:</label>
      <InputText id="author" v-model="meta.author"/>
    </div>
    <div class="field col-4">
      <label for="publisher">Publisher:</label>
      <InputText id="publisher" v-model="meta.publisher"/>
    </div>
    <div class="col-4">
      <div id="coverdiv">
        <img v-if="meta?.cover" id="cover" :src="meta?.cover" alt="cover"/>
        <br/>
        <Button label="Paste" icon="pi pi-image" class="mr-2"
                v-tooltip="'Paste a picture from clipboard to use as cover'"
                @click="paste_cover" rounded raised/>
      </div>
    </div>
    <div class="col-8">
      <TabView>
        <TabPanel header="Description">
          <div v-html="meta.description"></div>
        </TabPanel>
        <TabPanel header="Edit">
          <Textarea v-model="meta.description"
                    style="width: 100%; max-width: 100%; height: 40vh"/>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<style>
#coverdiv {
  max-height: 400px;
  max-width: 200px;
}

#cover {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
