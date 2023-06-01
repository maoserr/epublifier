<script setup lang="ts">
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import {ref, shallowRef} from "vue";

const prop = defineProps<{
  code: string
}>
()

const code = ref(prop.code)
const extensions = [javascript()]

const view = shallowRef()
const handleReady = (payload:any) => {
  view.value = payload.view
}
</script>

<template>
  <codemirror
      v-model="code"
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
