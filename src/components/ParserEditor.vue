<template>
  <div class="p-field p-col-12">
    <label>Parser Definition:</label>
    <prism-editor class="my-editor" v-model="txt_val" :highlight="highlighter"
                  line-numbers></prism-editor>
  </div>
</template>
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
<script lang="ts">
import {defineComponent} from "vue";


import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

import {PrismEditor} from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import {highlight, languages} from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles


export default defineComponent({
  name: 'Options UI',
  components: {
    PrismEditor
  },
  props: {
    parser: String,
    parser_obj: Object,
    txt: String
  },
  emits: ['status', 'update:txt'],
  mounted() {
    this.update_txt(this.parser);
  },
  computed: {
    txt_val: {
      set(newval:string) {
        this.$emit('update:txt', newval)
      },
      get(): string {
        return this.txt ?? ""
      }
    }
  },
  watch: {
    async parser(newparser) {
      this.update_txt(newparser)
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
        this.txt_val = newobj[pdoc][pcat]
      } else if ((pcat == "toc_parsers") || (pcat == "chap_parsers")) {
        this.txt_val = newobj[pdoc][pcat][pars]["code"]
      }
    }
  },
  methods: {
    update_txt(newparser: string | null | undefined) {
      if (newparser == null) {
        return
      }
      return ""
    },
    highlighter(code:string) {
      return highlight(code, languages.js, "javascript");
    }
  }
});
</script>
