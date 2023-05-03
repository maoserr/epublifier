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
        return {"": true};
      },
      set(value: { [s: string]: unknown; } | ArrayLike<unknown>) {
        this.$emit('update:modelValue', Object.entries(value)[0][0])
      }
    }
  },
  watch: {
    parser_obj: {
      handler() {
        let parserd = []
      },
      deep: true
    }
  },
});

</script>
