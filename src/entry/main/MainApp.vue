<template>
    <div id="app" class="grid" style="width:100%">
        <div class="col-12">
            <Message :closable=false>{{ status_txt }}
            </Message>
        </div>
        <div class="col-6">
            <TabView>
                <TabPanel header="Metadata">
                    <div class="grid">
                        <div class="field col-4">
                            <label for="title">Title:</label>
                            <InputText id="title" :value="meta?.title"/>
                        </div>
                        <div class="field col-4">
                            <label for="author">Author:</label>
                            <InputText id="author" :value="meta?.author"/>
                        </div>
                        <div class="field col-4">
                            <label for="publisher">Publisher:</label>
                            <InputText id="publisher" :value="meta?.publisher"/>
                        </div>
                        <div class="col-4">
                            <div id="coverdiv">
                                <img v-if="meta?.cover" id="cover" :src="meta?.cover" alt="cover"/>
                            </div>
                        </div>
                        <div class="col-8">
                            <div v-html="meta.description"></div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
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
                <template #header>
                    <div class="flex justify-content-between">
                        <span class="text-xl text-900 font-bold">Chapters</span>
                        <div style="float:right" class="flex gap-2">
                            <Button label="Parse" icon="pi pi-play"
                                    @click="run_parsers" rounded raised/>
                            <Button label="Epub" icon="pi pi-download"
                                    @click="compile_epub" rounded raised/>
                        </div>
                    </div>
                </template>
                <Column :rowReorder="true" headerStyle="width: 3rem" :reorderableColumn="false"/>
                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="title" header="URL Title" :sortable="true"></Column>
                <Column field="url" header="URL" :sortable="true">
                    <template #body="{data}:any">
                        <a :href="(data as any).url" target="_blank" rel="noopener noreferrer">
                            {{ (data as any).url }}</a>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<style>
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

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Message from "primevue/message";
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {onMounted, ref} from 'vue'
import browser from "webextension-polyfill";

import {Chapter, ChapterInfo, NovelMetaData} from "../../common/novel_data";
import {parse_chaps, compile_epub, addSandboxListener} from "./parse_funcs"
import {get_parsers} from "../../common/parser_manager";
import {SbxCommand, SendSandboxCmdWReply} from "../../common/sandbox_util";


const status_txt = ref("Loading...")
const meta = ref({title: 'N/A', description: 'N/A'} as NovelMetaData)
const chaps = ref([] as Chapter[])
const selected_chaps = ref([] as Chapter[])
const parser = ref('')
const progress = ref(0)

async function onLoadGetChapters() {
    const request = await browser.runtime.sendMessage(
        {cmd: "mainCreated"})
    if (request.action == "newChapList") {
        let chap_infos = JSON.parse(request.chaps)
        chaps.value = chap_infos.map((x:ChapterInfo)=>{
            return {
                info: {
                    title: x.title,
                    url: x.url,
                    parser: x.parser,
                    parse_doc: request.parser
                },
                title: x.title,
                html: '',
                html_parsed: ''
            }
        })
        meta.value = JSON.parse(request.metadata)
    }
}

function run_parsers() {
    console.log("Parsing...")
    parse_chaps(selected_chaps.value, meta.value, status_txt, progress)
}

function onRowReorder(event: any) {
    chaps.value = event.value;
}

onMounted(async () => {
    try {
        // Load initial chapters
        await onLoadGetChapters()

        // Load Parser
        let parser_txt = await get_parsers()
        await SendSandboxCmdWReply(SbxCommand.LoadParsers,
            parser_txt)

        // Setup permanent message pipeline
        addSandboxListener(chaps.value, status_txt);
        status_txt.value = "Loaded."
    } catch (error) {
        status_txt.value = "Error: " +
            ((error instanceof Error) ? error.message : String(error))
    }
})
</script>
