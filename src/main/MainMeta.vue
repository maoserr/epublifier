<script setup lang="ts">
import InputText from "primevue/inputtext";
import {meta} from "./main_state"
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
      </div>
    </div>
    <div class="col-8">
      <div v-html="meta.description"></div>
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
