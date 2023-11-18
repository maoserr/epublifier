<script setup lang="ts">

import Button from "primevue/button";
import InputGroup from 'primevue/inputgroup';
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import InputText from 'primevue/inputtext';

import {MsgCommand} from "../../../services/messaging/msg_types";
import {
  page_type,
  scroll,
  max_chaps,
  wait_s,
  next_id,
  title_id
} from "../../parser_state";
import {msg_sendwin} from "../../win_state";
import {write_info} from "../sidebar_utils";

async function sel_elnext() {
  const res = await msg_sendwin.send_message<{}, string>({
    command: MsgCommand.ContSelNext,
    data: {}
  }, 1, 0)
  write_info(res.message)
  next_id.value = res.data!
}

async function sel_title() {
  const res = await msg_sendwin.send_message<{}, string>({
    command: MsgCommand.ContSelTitle,
    data: {}
  }, 1, 0)
  write_info(res.message)
  title_id.value = res.data!
}

</script>

<template>
  <div class="grid">
    <div class="col-6">
      <InputNumber v-model="max_chaps" id="maxchap" input-class="mr-2"
                   :input-style="{width: '4rem'}" :min="1"/>
      <label for="maxchap">Parse max Chaps</label>
    </div>
    <div class="col-6">
      <InputNumber v-model="wait_s" id="wait_s" input-class="mr-2"
                   :maxFractionDigits="2"
                   :input-style="{width: '4rem'}" suffix="s" :min="0.01"/>
      <label for="wait_s">Per parse wait</label>
    </div>
    <div class="col-6 mt-2" v-if="page_type=='spa'">
      <InputGroup>
        <div class="p-float-label max-w-full">
          <InputText id="next_sel" type="text" v-model="next_id"/>
          <label for="next_sel">Next Selector:</label>
        </div>
        <Button icon="pi pi-search" @click="sel_elnext"/>
      </InputGroup>
    </div>
    <div class="col-6 mt-2" v-if="page_type=='spa'">
      <InputGroup>
        <div class="p-float-label max-w-full">
          <InputText id="title_sel" type="text" v-model="title_id"/>
          <label for="title_sel">Title Selector:</label>
        </div>
        <Button icon="pi pi-search" @click="sel_title"/>
      </InputGroup>

    </div>
    <div class="col-6" v-if="page_type=='spa'">
      <Checkbox inputId="scroll_chk" v-model="scroll" :binary="true"/>
      <label for="scroll_chk" class="ml-2">Scroll to end</label>
    </div>
  </div>
</template>

<style scoped>

</style>
