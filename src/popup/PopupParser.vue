<script setup lang="ts">
import Button from "primevue/button";
import Listbox from "primevue/listbox";
import InputText from "primevue/inputtext";
import Panel from "primevue/panel";
import {computed, onMounted, ref, watch} from "vue";
import {
  ParserDocDef,
  ParserResultAuto,
  ParserResultChap,
  ParserResultToc
} from "../common/parser_types";

import {parser, status_txt} from "./popup_state";
import {SendSandboxCmdWReply} from "../sandboxed/send_message";
import {SbxCommand, SbxOut} from "../common/sandbox_types";
import {get_parsers_definitions} from "../common/parser_manager";

const prop = defineProps<{
  url: string
  src: string
}>()

const emit = defineEmits<{
  (e: 'reparsed',
   type: 'toc' | 'chap',
   pres: ParserResultToc | ParserResultChap): void
}>()

watch(() => prop.src, async () => {
  if (parsers.value.length == 0) {
    await setup_parser()
  }
  await initial_parse()
})

const parsers = ref([] as ParserDocDef[])

const p_inputs_val: Record<string, any> = ref({})
const p_inputs: Record<string, any> = computed(() => {
  if (parser.value === undefined) {
    return {}
  }
  return parser.value!.inputs
})

function set_input_val(parser: ParserDocDef){
  let new_vals: Record<string, any> = {}
  Object.keys(parser.inputs).forEach(
      (x: any) =>
          new_vals[x] = parser.inputs[x].default ?? ''
  )
  p_inputs_val.value = new_vals
}

async function setup_parser() {
  // Load Parser
  const parser_txt = await get_parsers_definitions()
  const parsedefs_rep: SbxOut<any> = await SendSandboxCmdWReply(
      SbxCommand.LoadParsers, parser_txt)
  status_txt.value = parsedefs_rep.message
  parsers.value = parsedefs_rep.data.filter(
      (x:ParserDocDef)=>x.type=="toc")
}

async function initial_parse() {
  const pres = await SendSandboxCmdWReply(SbxCommand.ParseSource,
      {inputs: {}, url: prop.url, src: prop.src})
  status_txt.value = pres.message
  const auto_res = pres.data as ParserResultAuto
  parser.value = parsers.value.filter(
      (x: ParserDocDef) =>
          (x.parse_doc == auto_res.parse_doc)
          && (x.parser == auto_res.parser)
          && (x.type = auto_res.type)
  )[0]
  set_input_val(parser.value!)
  emit('reparsed', auto_res.type, auto_res.result)
}

async function reparse(evt: any) {
  if (parser.value === undefined) {
    return
  }
  const curr_parser: ParserDocDef = parser.value!
  try {
    const pres = await SendSandboxCmdWReply(SbxCommand.ParseSource, {
      doc: curr_parser.parse_doc,
      type: curr_parser.type,
      parser: curr_parser.parser,
      params: {inputs: p_inputs_val.value, url: prop.url, src: prop.src}
    })
    status_txt.value = pres.message
    console.log(pres)
    if (curr_parser.type === 'toc') {
      emit('reparsed', curr_parser.type, pres.data as ParserResultToc)
    } else {
      emit('reparsed', curr_parser.type, pres.data as ParserResultChap)
    }
  } catch (error) {
    status_txt.value = "Error: " +
        ((error instanceof Error) ? error.message : String(error))
  }
}

</script>

<template>
  <div class="grid">
    <div class="col-12">
      <Button label="Re-Parse" @click="reparse"
              icon="pi pi-file"/>
    </div>
    <div class="col-12">
      <Listbox v-model="parser" :options="parsers"
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
                                 @change="set_input_val($event.value)"
                                 v-model="p_inputs_val[k]"/>
                      <label v-if="inp.type=='text'" :for="k">{{ k }}</label>
                  </span>
          </div>
        </div>
      </Panel>
    </div>
  </div>
</template>
