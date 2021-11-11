<template>
  <TreeSelect v-model="value" :options="parsers_nodes"
              placeholder="Select Parser" scrollHeight="250px"/>
</template>
<script lang="ts">

import {defineComponent} from "vue";

import Message from 'primevue/message';
import Button from "primevue/button";
import TreeSelect from 'primevue/treeselect';

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';


export default defineComponent({
  name: 'Options UI',
  components: {
    Button,
    TreeSelect,
    Message
  },
  props: {
    modelValue: String,
    parser_obj: Object,
    toc_only: Boolean,
    chap_only: Boolean
  },
  emits: ["update:modelValue"],
  data() {
    return {
      parsers_nodes: null
    }
  },
  computed: {
    value: {
      get() {
        return {[this.modelValue]: true};
      },
      set(value) {
        this.$emit('update:modelValue', Object.entries(value)[0][0])
      }
    }
  },
  watch: {
    parser_obj: {
      handler() {
        let parserd = []
        Object.entries(this.parser_obj).forEach(
            ([key, val]) => {
              let doc_child = []
              if (!this.chap_only) {
                doc_child.push({key: key + "||main_parser", label: "Table of Content Auto Detector"})
                let toc_childs = []
                Object.entries(val["toc_parsers"]).forEach(
                    ([tkey, tval]) => {
                      toc_childs.push({key: key + "||toc_parsers||" + tkey, label: tval["name"]})
                    }
                )
                doc_child.push({
                  key: key + "||toc_parsers",
                  label: "Table of Content Parsers",
                  selectable: false,
                  children: toc_childs
                })
              }
              if (!this.toc_only) {
                doc_child.push({key: key + "||chap_main_parser", label: "Chapter Auto Detector"})
                let chap_childs = []
                Object.entries(val["chap_parsers"]).forEach(
                    ([tkey, tval]) => {
                      chap_childs.push({key: key + "||chap_parsers||" + tkey, label: tval["name"]})
                    }
                )
                doc_child.push({
                  key: key + "||chap_parsers",
                  label: "Chapter Parsers",
                  selectable: false,
                  children: chap_childs
                })
              }
              parserd.push({key: key, label: "Doc: " + key, selectable: false, children: doc_child});
            }
        );
        this.parsers_nodes = parserd;
      },
      deep: true
    }
  },
});

</script>