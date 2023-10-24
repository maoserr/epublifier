<script setup lang="ts">

import {selected_chaps} from "../../novel_state";

</script>

<template>
  <iframe title="Preview"
          :srcdoc="selected_chaps[selected_chaps.length-1]?.html_parsed || 'No data'"
          style="border-width: 1px;width: 100%;height: 30vh;overflow: auto;"></iframe>
</template>
