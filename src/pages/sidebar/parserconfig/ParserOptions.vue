<script setup lang="ts">
import RadioButton from 'primevue/radiobutton';
import Panel from "primevue/panel";

import LinksParse from "././parseopts/LinksParse.vue";
import NextParse from "././parseopts/ManualAdd.vue";
import TextParse from "././parseopts/TextParse.vue";

import {page_type} from "../../parser_state";

</script>

<template>
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
</template>
