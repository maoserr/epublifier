<script setup lang="ts">

import Panel from "primevue/panel";
import Listbox from "primevue/listbox";
import {ref, computed, ComputedRef, watch} from "vue";

import {get_default_inputs, ParseOpt, ParserInputDef} from "../../../../services/scraping/parser_types";
import InputText from "primevue/inputtext";
import {curr_parse_doc, parsers, p_inputs_val_text} from "../../sidebar_parsing";


const parser = ref<ParseOpt>()

const parser_ops: ComputedRef<ParseOpt[]> = computed(() => {
  let parse_op:ParseOpt[] = []
  for (let d of Object.keys(parsers.value)) {
    for (let p of Object.keys(parsers.value[d].text)) {
      parse_op.push({
        doc:d,
        parser:p
      })
    }
  }
  return parse_op
})

const p_inputs = computed<Record<string, ParserInputDef>>(()=>{
  if (parser.value != undefined) {
    return parsers.value[curr_parse_doc.value].text[parser.value.parser].inputs
  }
  return {}
})

watch(parser, ()=>{
  if (parser.value != undefined) {
    p_inputs_val_text.value = get_default_inputs(parsers.value[
        curr_parse_doc.value].text[parser.value.parser].inputs)
  }
})
</script>

<template>
  <Panel header="Text Parser" toggleable>
    <div class="grid">
      <div class="col-12">
        <Listbox v-model="parser" :options="parser_ops"
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
      <div class="col-12">
        <Panel header="Parser Options">
          <div class="grid">
            <div class="field col-6" v-for="(inp, k) in p_inputs">
                  <span class="p-float-label">
                      <InputText v-if="inp.type=='text'" :id="k.toString()" type="text"
                                 v-model="p_inputs_val_text[k]"/>
                      <label v-if="inp.type=='text'" :for="k">{{ k }}</label>
                  </span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  </Panel>
</template>

<style scoped>

</style>
