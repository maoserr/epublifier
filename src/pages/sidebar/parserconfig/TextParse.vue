<script setup lang="ts">

import Panel from "primevue/panel";
import Listbox from "primevue/listbox";
import {ref, computed, ComputedRef, watch} from "vue";

import {get_default_inputs, ParseOpt, ParserInputDef} from "../../../services/scraping/parser_types";
import InputText from "primevue/inputtext";
import {curr_parse_doc, parsers, parser_chap, p_inputs_val_text, wait_s, max_chaps, threads} from "../../parser_state";
import InputNumber from "primevue/inputnumber";

const parser_ops: ComputedRef<ParseOpt[]> = computed(() => {
  let parse_op: ParseOpt[] = []
  for (let d of Object.keys(parsers.value)) {
    for (let p of Object.keys(parsers.value[d].text)) {
      parse_op.push({
        doc: d,
        parser: p
      })
    }
  }
  return parse_op
})

const p_inputs = computed<Record<string, ParserInputDef>>(() => {
  if (parser_chap.value != undefined) {
    return parsers.value[curr_parse_doc.value].text[parser_chap.value.parser].inputs
  }
  return {}
})

watch(parser_chap, () => {
  if (parser_chap.value != undefined) {
    p_inputs_val_text.value = get_default_inputs(parsers.value[
        curr_parse_doc.value].text[parser_chap.value.parser].inputs)
  }
})
</script>

<template>
  <div class="grid">
    <div class="col-6">
      <Listbox v-model="parser_chap" :options="parser_ops"
               listStyle="max-height:12rem">
        <template #option="{option}:any">
          <div class="flex align-items-center">
            <div>[{{ (option as any).doc }}]
              {{ (option as any).parser }}
            </div>
          </div>
        </template>
      </Listbox>
    </div>
    <div class="col-6">
      <Panel header="Parser Options">
        <div class="grid">
          <div class="field col-12" v-for="(inp, k) in p_inputs">
                  <span class="p-float-label">
                      <InputText v-if="inp.type=='text'" :id="k.toString()" type="text"
                                 v-model="p_inputs_val_text[k]"/>
                      <label v-if="inp.type=='text'" :for="k">{{ k }}</label>
                  </span>
          </div>
        </div>
      </Panel>
    </div>
    <div class="col-6 mt-2">
      <InputNumber v-model="wait_s" id="wait_s" input-class="mr-2"
                   :maxFractionDigits="2"
                   :input-style="{width: '4rem'}" suffix="s" :min="0.01"/>
      <label for="wait_s">Per parse wait</label>
    </div>
    <div class="col-6">
      <InputNumber v-model="threads" id="threads" input-class="mr-2"
                   :input-style="{width: '4rem'}" :min="1"/>
      <label for="threads"># Connections</label>
    </div>
  </div>
</template>

<style scoped>

</style>
