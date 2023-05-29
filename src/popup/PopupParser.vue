<script setup lang="ts">
import Button from "primevue/button";
import Listbox from "primevue/listbox";
import InputText from "primevue/inputtext";
import Panel from "primevue/panel";
import {ref, computed} from "vue";
import {ParserDocDef} from "../common/parser_types";

import {parser} from "./popup_state";

defineProps<{
  parsers: ParserDocDef[]
}>()

defineEmits<{
  (e: 'reparse',
   p_inputs_val: Record<string, any>): void
}>()

const p_inputs = ref({} as Record<string, { type: any }>)
const p_inputs_val = computed({
  get() {
    let new_vals: Record<string, any> = {}
    if (parser.value === undefined) {
      return {}
    }
    Object.keys(parser.value.inputs).forEach(
        (x: any) =>
            new_vals[x] = parser.value!.inputs[x].default ?? ''
    )
    return new_vals
  },
  set() {
  }
})

function set_parser_inps(parser: ParserDocDef) {
  p_inputs.value = parser.inputs
}

</script>

<template>
  <div class="grid">
    <div class="col-12">
      <Button label="Re-Parse" @click="$emit('reparse', p_inputs_val)"
              icon="pi pi-file"/>
    </div>
    <div class="col-12">
      <Listbox v-model="parser" :options="parsers" @change="set_parser_inps($event.value)"
               listStyle="max-height:12rem">
        <template #option="{option}:any">
          <div class="flex align-items-center">
            <div>[{{ (option as any).parse_doc }}]
              ({{ (option as any).type }})
              {{ (option as any).parser }}
            </div>
          </div>
        </template>
      </Listbox>
    </div>
    <div class="col-12">
      <Panel header="Parser Options">
        <div class="grid">
          <div class="field col-4" v-for="(inp, k) in p_inputs">
                  <span class="p-float-label">
                      <InputText v-if="inp.type=='text'" :id="k.toString()" type="text"
                                 v-model="p_inputs_val[k]"/>
                      <label v-if="inp.type=='text'" :for="k">{{ k }}</label>
                  </span>
          </div>
        </div>
      </Panel>
    </div>
  </div>
</template>
