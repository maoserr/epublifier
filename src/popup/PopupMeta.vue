<script setup lang="ts">
import {NovelMetaData} from "../common/novel_data";

defineProps<{
  meta?: NovelMetaData,
  url: string
}>()

</script>

<template>
  <div class="grid">
    <div class="col-2"><b>Title</b></div>
    <div class="col-10">{{ meta?.title }}</div>
    <div class="col-2"><b>Author</b></div>
    <div class="col-10">{{ meta?.author }}</div>
    <div class="col-2"><b>Publisher</b></div>
    <div class="col-10">{{ meta?.publisher }}</div>
    <div class="col-2"><b>URL</b></div>
    <div class="col-10">{{ url }}</div>
    <div class="col-12">
      <h4>Description:</h4>
      <img v-if="meta?.cover" id="cover" width="200" style="float:left;margin:10px"
           :src="meta.cover" alt="cover"/>
      <span v-html="meta?.description"></span>
    </div>
  </div>
</template>

