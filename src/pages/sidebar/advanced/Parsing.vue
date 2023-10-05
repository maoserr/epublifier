<script setup lang="ts">

import RadioButton from 'primevue/radiobutton';
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import {ref} from "vue";
import InputText from "primevue/inputtext";
import Listbox from "primevue/listbox";
import Panel from "primevue/panel";

import LinksParse from "./parseparts/LinksParse.vue";
import NextParse from "./parseparts/NextParse.vue";
import TextParse from "./parseparts/TextParse.vue";

const parser=ref<string>("")
const parsers = ref<string[]>([])
const parse_type = ref<string>("list_link")
const page_type = ref<string>("regular")
const p_inputs_val = ref<Record<string, any>>({})
const p_inputs = ref<Record<string, any>>({})

function parse_links() {
}

function pick_title() {
}

function onDelete() {
}

function parse() {
}

function load_main() {
}


</script>

<template>
  <div class="grid">
    <div class="col-12">
      <Panel header="Page Options">
        <div class="grid">
          <div class="col-6">
            Parse chapters through:
            <div class="flex flex-wrap gap-3">
              <div class="flex align-items-center">
                <RadioButton v-model="parse_type" inputId="list_link"
                             name="parse_type" value="list_link"/>
                <label for="list_link" class="ml-2">List of links</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton v-model="parse_type" inputId="next_link"
                             name="parse_type" value="next_link"/>
                <label for="next_link" class="ml-2">Next link</label>
              </div>
            </div>
          </div>
          <div class="col-6">
            Website type:
            <div class="flex flex-wrap gap-3">
              <div class="flex align-items-center">
                <RadioButton v-model="page_type" inputId="regular"
                             name="page_type" value="regular"/>
                <label for="regular" class="ml-2">Pages</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton v-model="page_type" inputId="spa"
                             name="page_type" value="spa"/>
                <label for="spa" class="ml-2">App</label>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
    <div class="col-12" v-if="parse_type=='list_link'">
      <LinksParse/>
    </div>
    <div class="col-12" v-if="parse_type=='next_link'">
      <NextParse/>
    </div>
    <div class="col-12">
      <TextParse/>
    </div>
  </div>
</template>
