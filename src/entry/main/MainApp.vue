<template>
    <div id="app" class="grid" style="width:100%">
        <div class="col-12">
            <Message :closable=false>{{ status_txt }}
            </Message>
        </div>
        <div class="col-6">

        </div>
        <div class="col-6">
            <DataTable :value="chaps"
                       v-model:selection="selected_chaps"
                       :reorderableColumns="true"
                       @rowReorder="onRowReorder($event)"
                       selectionMode="multiple"
                       :metaKeySelection="false"
                       scrollable scrollHeight="70vh"
                       :paginator="true" :rows="100"
                       class="p-datatable-sm"
                       :rowsPerPageOptions="[100, 200,500]"
                       responsiveLayout="scroll">
                <Column :rowReorder="true" headerStyle="width: 3rem" :reorderableColumn="false"/>
                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="title" header="URL Title" :sortable="true"></Column>
                <Column field="url" header="URL" :sortable="true">
                    <template #body="{data}:any">
                        <a :href="(data as any).url" target="_blank" rel="noopener noreferrer">
                            {{(data as any).url}}</a>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Message from "primevue/message";

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {onMounted, ref} from 'vue'
import browser from "webextension-polyfill";

import {ChapterInfo, NovelMetaData} from "../../common/novel_data";

const status_txt = ref("Loading...")
const meta = ref({title: 'N/A', description: 'N/A'} as NovelMetaData)
const chaps = ref([] as ChapterInfo[])
const selected_chaps = ref([] as ChapterInfo[])
const parser = ref('')

function msg_func(request: any, send: any) {
    browser.runtime.onMessage.removeListener(msg_func);
    if (request.action == "newChapList") {
        chaps.value = JSON.parse(request.chaps)
        meta.value = JSON.parse(request.metadata)
    }
}

function onRowReorder(event: any) {
    chaps.value = event.value;
}

onMounted(async () => {
    try {
        browser.runtime.onMessage.addListener(msg_func);
        status_txt.value = "Loaded."
    } catch (error) {
        status_txt.value = "Error: " +
            ((error instanceof Error) ? error.message : String(error))
    }
})
</script>
