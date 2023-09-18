<script setup lang="ts">

import {Codemirror} from "vue-codemirror";
import {javascript} from "@codemirror/lang-javascript";
import {computed, shallowRef} from "vue";

import {curr_parser_txt} from "../sidebar_parsing";

const extensions = [
  javascript(),
]
const view = shallowRef()
const handleReady = (payload: any) => {
  view.value = payload.view
}
</script>

<template>
  <codemirror
      v-model="curr_parser_txt"
      placeholder="Code goes here..."
      :style="{ height: '65vh' }"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      @ready="handleReady"
  />
</template>

<style scoped>

</style>
