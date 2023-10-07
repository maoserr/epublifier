<script setup lang="ts">
import {ref} from "vue";

import Panel from "primevue/panel";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";

const scroll = ref<boolean>(false)
const max_chaps = ref<number>(5)
const wait_s = ref<number>(5)

function pick_next(event:Event){
}

function pick_title(event:Event) {

}
</script>

<template>
  <Panel header="Next Parser" toggleable>
    <div class="grid">
      <Button label="Pick Next" @click="pick_next" class="mr-2"
              v-tooltip="'Select the next chapter link/button for auto progression'"/>
      <Button label="Pick Title" @click="pick_title" class="mr-2"
              v-tooltip="'Select the title element, otherwise auto-detect'"/>
      <Checkbox v-model="scroll" :binary="true"
                v-tooltip="'Scroll page to bottom after auto progression, ' +
                     'If this is checked wait time is also applied after scroll'"/>
      <InputNumber v-model="max_chaps" id="maxchap" input-class="mr-2"
                   v-tooltip="'Maximum chapters to parse'"
                   :input-style="{width: '4rem'}" suffix="c" :min="1"/>
      <InputNumber v-model="wait_s" id="wait_s" input-class="mr-2"
                   :maxFractionDigits="2" v-tooltip="'Wait interval between parsing'"
                   :input-style="{width: '4rem'}" suffix="s" :min="0.01"/>
    </div>
  </Panel>
</template>

<style scoped>

</style>
