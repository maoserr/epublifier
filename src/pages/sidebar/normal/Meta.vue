<script setup lang="ts">
import {meta} from "../sidebar_state"


</script>

<template>
  Title: {{ meta?.title }}<br/>
  Author: {{ meta?.author }}<br/>
  <img v-if="meta?.cover" id="cover" :src="meta?.cover" alt="cover"/>
  <div v-html="meta?.description"></div>
</template>

<style>

#cover {
  float: left;
  margin: 5px;
  max-height: 200px;
  max-width: 100px;
  object-fit: contain;
}
</style>
