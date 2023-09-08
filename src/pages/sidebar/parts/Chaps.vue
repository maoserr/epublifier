<script setup lang="ts">

import DataTable from "primevue/datatable";
import Column from "primevue/column";

import {
  chaps,
  selected_chaps
} from "../sidebar_state"


</script>

<template>
  <DataTable :value="chaps"
             v-model:selection="selected_chaps"
             @rowReorder="chaps = $event.value"
             selectionMode="multiple"

             class="p-datatable-sm"
             responsiveLayout="scroll"
             tableStyle="min-width: 50rem">
    <Column :rowReorder="true" headerStyle="width: 3rem" :exportable="false" :reorderableColumn="false"/>
    <Column field="title" header="Title"></Column>
  </DataTable>
</template>
