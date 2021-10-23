<template>
  <div id="app">
    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-col-6">
        <label for="parsecat">Category:</label>
        <Dropdown id="parsecat" v-model="selectedParsecat" :options="parsecats" optionLabel="name"
                  placeholder="Select a Parser Category Type"/>
      </div>
      <div class="p-field p-col-6">
        <label for="parser">Parser:</label>
        <Dropdown id="parser" v-model="selectedParser" :options="parsers" optionLabel="name"
                  placeholder="Select a Parser Category Type"/>
      </div>
      <div class="p-field">
        <label for="parser_txt">Parser Definition:</label>
        <Textarea id="parser_txt" v-model="parser_config" required="true" rows="20" cols="150"/>
      </div>
      <div class="p-field p-col-6 p-md-3">
        <Button label="Reset" icon="pi pi-minus-circle" @click="reset_options"/>
      </div>
      <div class="p-field p-col-6 p-md-3">
        <Button label="Save" icon="pi pi-check" @click="save_options"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import browser from "webextension-polyfill";

import Dropdown from 'primevue/dropdown';
import Button from "primevue/button";
import Textarea from "primevue/textarea";

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

import {get_initial, load_parsers, save_parsers} from "../../common/parser_loader"

export default defineComponent({
  name: 'Options UI',
  components: {
    Textarea,
    Button,
    Dropdown
  },
  data() {
    return {
      selectedParsecat: null,
      parsecats: [
        {name: "Main Parser", code: 'main'},
        {name: "Table of Content Parser", code: 'toc'},
        {name: "Chapter Parser", code: 'chap'}
      ],
      selectedParser: null,
      parser_config: "",
      txt: ""
    }
  },
  async mounted() {
    this.parser_config = await load_parsers();
  },
  computed: {
    parsers(): Record<string, string>[] {
      return [
        {name: "Test", code: "test"}
      ]
    }
  },
  methods: {
    async save_options() {
      await save_parsers(this.parser_config);
      window.close();
    },
    async reset_options() {
      this.parser_config = await get_initial();
    }
  }
});
</script>
