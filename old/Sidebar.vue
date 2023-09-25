<script setup lang="ts">

import Listbox from "primevue/listbox";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Toolbar from "primevue/toolbar";
import Panel from "primevue/panel";
import Button from "primevue/button";
</script>

<template>
  Parse Current Page as:
  List of Chapters
  Chapter

  Next Chapter Fetch Method:
  Background Fetch
  Follow Link
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
  <Toolbar>
    <template #start>
      <Button label="Pick Next" @click="pick_next" class="mr-2"
              v-tooltip="'Select the next chapter link/button for auto progression'"/>
      <Button label="Pick Title" @click="pick_title" class="mr-2"
              v-tooltip="'Select the title element, otherwise auto-detect'"/>
      <Checkbox v-model="scroll" :binary="true"
                v-tooltip="'Scroll page to bottom after auto progression, ' +
                     'If this is checked wait time is also applied after scroll'"/>
    </template>
    <template #center>
      <Button icon="pi pi-times" @click="onDelete" class="mr-2"
              v-tooltip="'Delete selected chapters'"
              severity="danger" rounded raised/>
    </template>
    <template #end>
      <Button label="Parse" @click="parse" class="mr-2"/>
      <InputNumber v-model="max_chaps" id="maxchap" input-class="mr-2"
                   v-tooltip="'Maximum chapters to parse'"
                   :input-style="{width: '4rem'}" suffix="c" :min="1"/>

      <InputNumber v-model="wait_s" id="wait_s" input-class="mr-2"
                   :maxFractionDigits="2" v-tooltip="'Wait interval between parsing'"
                   :input-style="{width: '4rem'}" suffix="s" :min="0.01"/>
      <Button label="Load" @click="load_main" icon="pi pi-book"
              v-tooltip="'Load the epub generator interface'"/>
    </template>
  </Toolbar>
</template>

<style scoped>

</style>
