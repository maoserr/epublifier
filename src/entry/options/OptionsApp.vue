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
import {get_initial, load_parsers, save_parsers, load_yaml_doc} from "../../common/parser_loader";
import browser from "webextension-polyfill";

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
    this.parsers = await load_parsers();
  },
  methods: {
    async uploader(event) {
      this.status_txt = 'Importing file.'
      if (event.files.length < 1) {
        return
      }
      let name = event.files[0].name
      let file_txt = await event.files[0].text();
      await this.import_yaml({name: name, text: file_txt});
    },
    export_parser() {
      if (this.selectedParser == null) {
        return
      }
      let p_sp = this.selectedParser.split("||");
      let pdoc = p_sp[0];
      let yaml = dump(this.parsers[pdoc]);
      let blob = new Blob([yaml], {type: "text/javascript"});
      let url = URL.createObjectURL(blob);
      browser.downloads.download({
        url: url,
        filename: pdoc + ".yaml",
      });
      this.status_txt = 'Parsers exported: ' + pdoc;
    },
    async import_parser(import_txt) {
      let fullname = import_txt.name
      let name = fullname.split(/[\\/]/).pop().split(".")[0];
      if (this.parsers.hasOwnProperty(name)) {
        this.status_txt = `Document ${name} already exists}.`
        return
      }
      this.parsers[name] = await load_yaml_doc(import_txt.text)
      this.status_txt = `Document ${name} imported.`
    },
    async save_options() {
      if (this.selectedParser == null) {
        return
      }
      let p_sp = this.selectedParser.split("||");
      let pdoc = p_sp[0];
      let pcat = p_sp[1];
      let pars = null;
      if (p_sp.length > 2) {
        pars = p_sp[2];
      }
      let save_msg
      if ((pcat == "main_parser") || (pcat == "chap_main_parser")) {
        this.parsers[pdoc][pcat] = this.txt;
        save_msg = `Parser saved: ${pdoc} - ${pcat}`
      } else if ((pcat == "toc_parsers") || (pcat == "chap_parsers")) {
        this.parsers[pdoc][pcat][pars]["code"] = this.txt;
        save_msg = `Parser saved: ${pdoc} - ${pcat} - ${pars}`
      }
      await save_parsers(this.parsers);
      this.status_txt = save_msg;
    },
    async reset_options() {
      this.parsers = await get_initial();
      this.status_txt = `Parser reset to main only.`;
    }
  }
});
</script>
