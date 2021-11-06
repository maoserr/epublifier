<template>
  <div class="p-field p-col-4 p-md-4">
    <label for="title">Title:</label>
    <InputText id="title" type="text" :value="tit" @input="$emit('update:tit', $event.target.value)" :disabled="edit"/>
  </div>
  <div class="p-field p-col-4 p-md-4">
    <label for="author">Author:</label>
    <InputText id="author" type="text" :value="auth" @input="$emit('update:auth', $event.target.value)" :disabled="edit"/>
  </div>
  <div class="p-field p-col-4 p-md-4">
    <label for="publisher">Publisher:</label>
    <InputText id="publisher" type="text" :value="pub" @input="$emit('update:pub', $event.target.value)" :disabled="edit"/>
  </div>
  <div class="p-field p-col-4 p-md-4">
    <label for="cover">Cover:</label>
    <div id="coverdiv">
      <img id="cover" :src="cov"/>
    </div>
  </div>
  <div class="p-field p-col-8 p-md-8">
    <label for="desc">Description:</label>
    <div id="desc" v-html="desc"></div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

import InputText from 'primevue/inputtext';

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';


export default defineComponent({
  name: 'Novel Metadata',
  components: {
    InputText,
  },
  props: {
    edit: String,
    tit: String,
    auth: String,
    pub: String,
    cov: String,
    desc: String
  },
  emits: ['update:tit', 'update:auth', 'update:pub', 'update:cov', 'update:desc']
});

</script>
<style>
#desc {
  font-size: 1.4em;
}

#coverdiv {
  max-height: 400px;
  max-width: 200px;
}

#cover {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>