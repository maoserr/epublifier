<script setup lang="ts">

import InputText from "primevue/inputtext";
import Panel from "primevue/panel";
import Listbox from "primevue/listbox";
import Button from "primevue/button";
import {computed, ComputedRef, watch} from "vue";

import {get_default_inputs, ParseOpt, ParserInputDef} from "../../../services/scraping/parser_types";
import {curr_parse_doc, p_inputs_val_link, parser, parsers} from "../../parser_state";
import InputGroup from "primevue/inputgroup";
import {msg_sendwin} from "../../win_state";
import {MsgCommand} from "../../../services/messaging/msg_types";
import {write_info} from "../sidebar_utils";

defineEmits<{
  parse_links: [add: boolean]
}>()

const parser_ops: ComputedRef<ParseOpt[]> = computed(() => {
  let parse_op: ParseOpt[] = []
  for (let d of Object.keys(parsers.value)) {
    for (let p of Object.keys(parsers.value[d].links)) {
      parse_op.push({
        doc: d,
        parser: p
      })
    }
  }
  return parse_op
})

const p_inputs = computed<Record<string, ParserInputDef>>(() => {
  if (parser.value != undefined) {
    return parsers.value[curr_parse_doc.value].links[parser.value.parser].inputs
  }
  return {}
})

async function set_sel(id: string, tags: string[], postfix: string) {
  const res = await msg_sendwin.send_message<{}, string>({
    command: MsgCommand.ContSelUser,
    data: {tags: tags}
  }, 1, 0)
  write_info(res.message)
  if (res.data != ''){
    p_inputs_val_link.value[id] = res.data! + postfix
  }
}

watch(parser, () => {
  if (parser.value != undefined) {
    p_inputs_val_link.value = get_default_inputs(parsers.value[
        curr_parse_doc.value].links[parser.value.parser].inputs)
  }
})

</script>

<template>
  <div class="grid">
    <div class="col-6">
      <Button label="(Re)Parse Links" class="mr-2 mb-2" @click="$emit('parse_links', false)" icon="pi pi-file"/>
      <Button label="Add Links" class="mb-2" @click="$emit('parse_links',true)" icon="pi pi-file"/>
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
    <div class="col-6">
      <Panel header="Parser Options">
        <div class="grid">
          <div class="field col-12" v-for="(inp, k) in p_inputs">
            <span v-if="inp.type=='text'" class="p-float-label">
                <InputText :id="k" type="text"
                           v-model="p_inputs_val_link[k]"/>
                <label :for="k">{{ k }}</label>
            </span>
            <InputGroup v-if="inp.type=='selector'">
              <span class="p-float-label max-w-full">
                <InputText :id="k" type="text" v-model="p_inputs_val_link[k]"/>
                <label :for="k">{{ k }}</label>
              </span>
              <Button icon="pi pi-search" @click="set_sel(k, inp.filters!, inp.postfix!)"/>
            </InputGroup>
          </div>
        </div>
      </Panel>
    </div>
  </div>
</template>

<style scoped>

</style>
