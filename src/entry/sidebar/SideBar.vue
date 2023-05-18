<script setup lang="ts">
import Button from 'primevue/button';


function close(evt:any){
  window.parent.postMessage({
    msg: 'SALADICT_CLOSE'
  }, '*')
}
</script>

<template>
<div>Hello
  <Button label="Close" @click="close"
          icon="pi pi-book"/>
</div>
</template>

<style scoped>

</style>
