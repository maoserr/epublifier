<script setup lang="ts">

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import {ref} from "vue";

const chaps=ref<[]>([])
const selected_chaps=ref<[]>([])
</script>

<template>
  <DataTable :value="chaps"
             v-model:selection="selected_chaps"
             @rowReorder="chaps = $event.value"
             selectionMode="multiple"
             scrollable scrollHeight="70vh"
             class="p-datatable-sm"
             responsiveLayout="scroll"
             tableStyle="min-width: 50rem">
    <Column :rowReorder="true" headerStyle="width: 3rem" :exportable="false" :reorderableColumn="false"/>
    <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
    <Column field="title" header="Title"></Column>
  </DataTable>
</template>
