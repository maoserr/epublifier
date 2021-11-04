<template>
  <div class="p-field p-col-12">
    <label>Parser Definition:</label>
    <prism-editor class="my-editor" v-model="txt" :highlight="highlighter"
                  line-numbers></prism-editor>
  </div>
  <div class="p-field p-col-3 p-md-3">
    <FileUpload mode="basic" name="files[]" :auto="true" chooseLabel="Import YAML" :customUpload="true"
                @uploader="uploader"/>
  </div>
  <div class="p-field p-col-3 p-md-3">
    <Button label="Export YAML" icon="pi pi-download" @click="export_yaml"/>
  </div>
  <div class="p-field p-col-3 p-md-3">
    <Button label="Reset Initial" class="p-button-warning" icon="pi pi-minus-circle" @click="this.$emit('reset')"/>
  </div>
  <div class="p-field p-col-3 p-md-3">
    <Button label="Save" class="p-button-success" icon="pi pi-check" @click="this.$emit('save', this.txt);"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

import Button from "primevue/button";
import FileUpload from 'primevue/fileupload';

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

import {PrismEditor} from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles

import {dump} from "js-yaml";
import browser from "webextension-polyfill";

export default defineComponent({
  name: 'Options UI',
  components: {
    PrismEditor,
    FileUpload,
    Button,
  },
  props: {
    parser: String,
    parser_obj: Object
  },
  emits: ['status', 'save', 'reset', 'import'],
  data() {
    return {
      txt: ""
    }
  },
  watch: {
    async parser(newparser) {
      if (newparser == null) {
        return
      }
      let p_sp = newparser.split("||");
      let pdoc = p_sp[0];
      let pcat = p_sp[1];
      let pars = null;
      if (p_sp.length > 2) {
        pars = p_sp[2];
      }
      if ((pcat == "main_parser") || (pcat == "chap_main_parser")) {
        this.txt = this.parser_obj[pdoc][pcat]
      } else if ((pcat == "toc_parsers") || (pcat == "chap_parsers")) {
        this.txt = this.parser_obj[pdoc][pcat][pars]["code"]
      }
    },
    async parser_obj(newobj) {
      if (this.parser == null) {
        return
      }
      let p_sp = this.parser.split("||");
      let pdoc = p_sp[0];
      let pcat = p_sp[1];
      let pars = null;
      if (p_sp.length > 2) {
        pars = p_sp[2];
      }
      if ((pcat == "main_parser") || (pcat == "chap_main_parser")) {
        this.txt = newobj[pdoc][pcat]
      } else if ((pcat == "toc_parsers") || (pcat == "chap_parsers")) {
        this.txt = newobj[pdoc][pcat][pars]["code"]
      }
    }
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.js);
    },
    async uploader(event) {
      let vm = this
      this.$emit('status', 'Importing file.');
      if (event.files.length < 1) {
        return
      }
      let name = event.files[0].name
      let file_txt = await event.files[0].text();
      vm.$emit('import', {name: name, text: file_txt})
    },
    export_yaml() {
      if (this.parser == null) {
        return
      }
      let p_sp = this.parser.split("||");
      let pdoc = p_sp[0];
      let yaml = dump(this.parser_obj[pdoc]);
      let blob = new Blob([yaml], {type: "text/yaml"});
      let url = URL.createObjectURL(blob);
      browser.downloads.download({
        url: url,
        filename: pdoc + ".yaml",
      });
      this.$emit('status', 'Parsers exported: ' + pdoc);
    },
  }
});
</script>
<style>
/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: #2d2d2d;
  color: #ccc;
  height: 20rem;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>