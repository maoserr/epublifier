<script setup lang="ts">

import {ref} from "vue";

const text = ref<string>("")
</script>

<template>
  <iframe title="Preview" :srcdoc="text"
          style="border-width: 1px;width: 100%;height: 65vh;overflow: auto;"></iframe>
</template>
