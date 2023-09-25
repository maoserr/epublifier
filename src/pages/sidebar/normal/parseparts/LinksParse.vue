<script setup lang="ts">

import InputText from "primevue/inputtext";
import Panel from "primevue/panel";
import Listbox from "primevue/listbox";
import Button from "primevue/button";
import {ref} from "vue";

const parser=ref<string>("")
const parsers = ref<string[]>([])
const p_inputs_val = ref<Record<string, any>>({})
const p_inputs = ref<Record<string, any>>({})

function parse_links() {
}
</script>

<template>
  <Panel header="Link Parser" toggleable>
    <div class="grid">
      <div class="col-12">
        <Button label="(Re)Parse Links" @click="parse_links" icon="pi pi-file"/>
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
                                 v-model="p_inputs_val[k]"/>
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
