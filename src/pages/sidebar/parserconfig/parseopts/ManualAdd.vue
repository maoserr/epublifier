<script setup lang="ts">
import {ref} from "vue";

import Panel from "primevue/panel";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import InputText from 'primevue/inputtext';
import {MsgCommand} from "../../../../services/messaging/msg_types";
import {container_win} from "../../SideBar.vue"
import {page_type} from "../../../../services/parser_state";

const scroll = ref<boolean>(false)
const max_chaps = ref<number>(5)
const wait_s = ref<number>(5)
const next_id = ref<string>('')
const title_id = ref<string>('')

export async function sel_elnext(){
  await container_win.send_message<{}, { url: string; src: string }>({
    command: MsgCommand.ContSelNext,
    data: {}
  })
}

export async function sel_title() {
  await container_win.send_message<{}, { url: string; src: string }>({
    command: MsgCommand.ContSelNext,
    data: {}
  })
}

</script>

<template>
  <Panel header="Next Parser" toggleable>
    <div class="grid">
      <div class="col-12" v-if="page_type=='spa'">
        <Button label="Pick Next Element" @click="sel_elnext" class="mr-2"/>
        <InputText type="text" v-model="next_id"/>
      </div>
      <div class="col-12" v-if="page_type=='spa'">
        <Button label="Pick Title Element" @click="sel_title" class="mr-2"/>
        <InputText type="text" v-model="title_id"/>
      </div>
      <div class="col-12" v-if="page_type=='spa'">
        <Checkbox inputId="scroll_chk" v-model="scroll" :binary="true"/>
        <label for="scroll_chk" class="ml-2">Scroll to end of page after each parse</label>
      </div>
      <div class="col-12">
        <InputNumber v-model="max_chaps" id="maxchap" input-class="mr-2"
                     :input-style="{width: '4rem'}" suffix="c" :min="1"/>
        <label for="maxchap">Max Chaps to parse</label>
      </div>
      <div class="col-12">
        <InputNumber v-model="wait_s" id="wait_s" input-class="mr-2"
                     :maxFractionDigits="2"
                     :input-style="{width: '4rem'}" suffix="s" :min="0.01"/>
        <label for="wait_s">Seconds to wait between parse</label>
      </div>
    </div>
  </Panel>
</template>

<style scoped>

</style>
