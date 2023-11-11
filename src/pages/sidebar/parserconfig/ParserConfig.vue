<script setup lang="ts">
import LinksParse from "./parseopts/LinksParse.vue";
import NextParse from "./parseopts/ManualAdd.vue";
import TextParse from "./parseopts/TextParse.vue";
import {page_type} from "../../parser_state";

</script>

<template>
  <div class="grid">
    <LinksParse/>
    <NextParse/>
    <TextParse/>
  </div>
</template>

<style scoped>

</style>
