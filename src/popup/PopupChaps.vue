<script setup lang="ts">
import {Chapter} from "../common/novel_data";

defineProps<{
  chaps: Chapter[]
}>()
</script>

<template>
  <ol>
    <li v-for="item in chaps">
      {{ item?.info.title }}: <a target="_blank" :href="item?.info.url">{{ item?.info.url }}</a>
    </li>
  </ol>
</template>

<style scoped>

</style>
