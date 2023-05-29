<script setup lang="ts">
import {ChapterInfo} from "../common/novel_data";

defineProps<{
  chaps: ChapterInfo[]
}>()
</script>

<template>
  <ol>
    <li v-for="item in chaps">
      {{ item?.title }}: <a target="_blank" :href="item?.url">{{ item?.url }}</a>
    </li>
  </ol>
</template>

<style scoped>

</style>
