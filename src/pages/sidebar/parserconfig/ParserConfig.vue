<script setup lang="ts">

import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import Panel from "primevue/panel";
import RadioButton from "primevue/radiobutton";

import {Codemirror} from "vue-codemirror";
import {computed, shallowRef} from "vue";
import {javascript} from "@codemirror/lang-javascript";

import {curr_parser_txt, page_type} from "../../parser_state";

import LinksParse from "./parseopts/LinksParse.vue";
import NextParse from "./parseopts/ManualAdd.vue";
import TextParse from "./parseopts/TextParse.vue";

const emits = defineEmits<{
  
}>()

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
  <TabPanel header="Parser Config">
    <TabView>
      <TabPanel header="Parse Options">
        <div class="grid">
          <div class="col-12">
            <Panel header="Page Options">
              <div class="grid">
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
          <div class="col-12">
            <LinksParse/>
          </div>
          <div class="col-12">
            <NextParse/>
          </div>
          <div class="col-12">
            <TextParse/>
          </div>
        </div>
      </TabPanel>
      <TabPanel header="Parser Definition">
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
      </TabPanel>
    </TabView>
  </TabPanel>
</template>

<style scoped>

</style>
