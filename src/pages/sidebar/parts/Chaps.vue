<script setup lang="ts">

import DataTable from "primevue/datatable";
import Column from "primevue/column";

import {
  chaps,
  selected_chaps
} from "../sidebar_state"
import {Chapter} from "../../../services/novel/novel_data";
import {Ref} from "vue";

function reorder(reordered_chaps: Ref<Chapter[]>) {
  chaps.value = reordered_chaps.value
}
</script>

<template>
  <DataTable :value="chaps"
             v-model:selection="selected_chaps"
             @rowReorder="reorder($event)"
             selectionMode="multiple"
             :metaKeySelection="false"
             scrollable scrollHeight="40vh"
             class="p-datatable-sm"
             responsiveLayout="scroll"
             tableStyle="min-width: 50rem">
    <Column :rowReorder="true" headerStyle="width: 2rem" :reorderableColumn="false"/>
    <Column selectionMode="multiple" style="width: 2rem" :exportable="false"></Column>
    <Column field="html_parsed" header="Parsed">
      <template #body="{data}:any">
        <i class="pi" :class="(!(data as any).html_parsed)?'pi-circle':'pi-check'"></i>
      </template>
    </Column>
    <Column field="title" header="Title"></Column>
  </DataTable>
</template>
