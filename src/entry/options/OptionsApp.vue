<template>
  <div id="app">
    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-col-12">
        <Message :closable="false">{{ status_txt }}</Message>
      </div>
      <div class="p-field p-col-8 p-md-8">
        <label>Parser:</label>
        <ParserSelector
            :parser_obj="parsers"
            v-model="selectedParser"></ParserSelector>
      </div>
      <div class="p-field p-col-4 p-md-4">
        <label>Add/Remove parser:</label>
        <div class="p-inputgroup">
          <InputText type="text" v-model="new_parser"></InputText>
          <Button class="p-button-success" icon="pi pi-plus-circle" iconPos="right" @click="add_parser"/>
          <Button class="p-button-warning" icon="pi pi-minus-circle" iconPos="right" @click="rem_parser"/>
        </div>
      </div>
      <ParserEditor
          :parser_obj="parsers"
          :parser="selectedParser"
          v-model:txt="txt"
          @status="status_txt=$event"></ParserEditor>
      <div class="p-field p-col-3 p-md-3">
        <FileUpload mode="basic" name="files[]" :auto="true" chooseLabel="Import YAML" :customUpload="true"
                    @uploader="uploader"/>
      </div>
      <div class="p-field p-col-3 p-md-3">
        <Button label="Export YAML" icon="pi pi-download" @click="export_yaml"/>
      </div>
      <div class="p-field p-col-3 p-md-3">
        <Button label="Reset Initial" class="p-button-warning" icon="pi pi-minus-circle" @click="reset_options"/>
      </div>
      <div class="p-field p-col-3 p-md-3">
        <Button label="Save" class="p-button-success" icon="pi pi-check" @click="save_options"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

import ParserSelector from '../../components/ParserSelector.vue';
import ParserEditor from '../../components/ParserEditor.vue';

import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import Button from "primevue/button";
import Message from 'primevue/message';

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

export default defineComponent({
  name: 'Options UI',
  components: {
    ParserEditor,
    ParserSelector,
    Message,
    FileUpload,
    InputText,
    Button
  },
  data() {
    return {
      selectedParser: null,
      parsers: null,
      new_parser: null,
      status_txt: "",
      txt: ""
    }
  },
  async mounted() {
  },
  methods: {
    async uploader(event: { files: string | any[]; }) {
      this.status_txt = 'Importing file.'
      if (event.files.length < 1) {
        return
      }
      let name = event.files[0].name
      let file_txt = await event.files[0].text();
    },
    export_parser() {
      if (this.selectedParser == null) {
        return
      }
    },
    async import_parser(import_txt: { name: any; }) {
      let fullname = import_txt.name
      let name = fullname.split(/[\\/]/).pop().split(".")[0];
    },
    async save_options() {
    },
    async reset_options() {
      this.status_txt = `Parser reset to main only.`;
    }
  }
});
</script>
