<template>
  <div>
    <Button label="Parse" @click="parse" icon="pi pi-book"/>
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {onMounted, ref} from "vue";
import {Readability} from "@mozilla/readability";



const text = ref('')

window.addEventListener('message', evt => {
  const data = evt.data
  switch (data.msg) {
    case 'PARSED_PAGE':
      let parser = new DOMParser();
      let dom = parser.parseFromString(data.source, "text/html");
      console.log(dom)
      let out=new Readability(dom).parse()
      text.value = out?.content ?? ""
      break;
  }
})

function parse(evt: any) {
  window.parent.postMessage({
    msg: 'PARSE_PAGE'
  }, '*' as WindowPostMessageOptions)
}

onMounted( async () =>{

})

</script>

<style scoped>

</style>
