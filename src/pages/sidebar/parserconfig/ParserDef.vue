<script setup lang="ts">

import {Codemirror} from "vue-codemirror";
import {computed, shallowRef} from "vue";
import {curr_parser_txt} from "../../parser_state";
import {javascript} from "@codemirror/lang-javascript";


const code = computed({
  get() {
    return curr_parser_txt.value['main']
  }, set(val: string) {
    curr_parser_txt.value['main'] = val
  }
})

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
        v-model="code"
        placeholder="Code goes here..."
        :style="{ height: '80vh' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
        @ready="handleReady"
    />
</template>

<style scoped>

</style>
