<script setup lang="ts">

import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import {ref} from "vue";

const scroll=ref<boolean>()
const max_chaps=ref<number>()
const wait_s=ref<number>()

function pick_next(){}
function pick_title(){}
function onDelete(){}
function parse(){}
function load_main(){}
</script>

<template>
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
