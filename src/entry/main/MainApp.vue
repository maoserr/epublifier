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
                <TabPanel header="Preview">
                    <iframe :srcdoc="selected_chaps[0]?.html_parsed" id="preview"></iframe>
                </TabPanel>
                <TabPanel header="Edit">
                    <Textarea v-if="selected_chaps.length>0"
                              v-model="selected_chaps[0].html_parsed"
                              style="width: 100%; max-width: 100%; height: 70vh"
                    ></Textarea>
                </TabPanel>
                <TabPanel header="Original">
                    <iframe :srcdoc="selected_chaps[0]?.html" id="preview"></iframe>
                </TabPanel>
            </TabView>
        </div>
        <div class="col-6">

            <Toolbar>
                <template #start>
                    <Button label="New" icon="pi pi-plus" class="mr-2" rounded raised/>
                    <Button icon="pi pi-times" @click="onDelete" class="mr-2" severity="danger" rounded raised/>
                    <Button label="CSV" @click="onCSV" icon="pi pi-download" rounded raised/>
                </template>

                <template #end>
                    <Button label="Parse" icon="pi pi-play" class="mr-2"
                            @click="run_parsers" :disabled="parse_disable" rounded raised/>
                    <Button label="Epub" icon="pi pi-download" severity="success"
                            @click="run_epub" :disabled="epub_disable" rounded raised/>
                </template>
            </Toolbar>
            <ProgressBar :value="progress"></ProgressBar>
            <DataTable :value="chaps" ref="dt"
                       v-model:selection="selected_chaps"
                       :reorderableColumns="true"
                       @rowReorder="onRowReorder($event)"
                       selectionMode="multiple"
                       scrollable scrollHeight="70vh"
                       :paginator="true" :rows="100"
                       class="p-datatable-sm"
                       :rowsPerPageOptions="[100, 200,500]"
                       responsiveLayout="scroll">
                <Column :rowReorder="true" headerStyle="width: 3rem" :exportable="false" :reorderableColumn="false"/>
                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="title" header="Title" :sortable="true"></Column>
                <Column field="info.url" header="URL" :sortable="true">
                    <template #body="{data}:any">
                        <a :href="(data as any).info.url" target="_blank" rel="noopener noreferrer">
                            {{ (data as any).info.url.slice(0, 25) }}...</a>
                    </template>
                </Column>
                <Column field="html_parsed" header="Parsed">
                    <template #body="{data}:any">
                        <i class="pi" :class="(!(data as any).html_parsed)?'pi-circle':'pi-check'"></i>
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

#preview {
    border-width: 1px;
    width: 100%;
    height: 75vh;
    overflow: auto;
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
import Textarea from "primevue/textarea";
import ProgressBar from 'primevue/progressbar';
import Toolbar from 'primevue/toolbar';


import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {computed, onMounted, ref} from 'vue'
import browser from "webextension-polyfill";

import {Chapter, ChapterInfo, NovelMetaData} from "../../common/novel_data";
import {parse_chaps, compile_epub, addSandboxListener} from "./parse_main"
import {get_parsers_definitions} from "../../common/parser_manager";
import {SendSandboxCmdWReply} from "../sandboxed/send_message";
import {SbxCommand} from "../sandboxed/messages";


const status_txt = ref("Loading...")
const meta = ref({title: 'N/A', description: 'N/A'} as NovelMetaData)
const chaps = ref([] as Chapter[])
const selected_chaps = ref([] as Chapter[])
const progress = ref(0)
const dt = ref();
const parse_disable = computed({
    get(){return selected_chaps.value.length==0},
    set(){}
})
const epub_disable = computed({
    get(){
        if (selected_chaps.value.length == 0)
            return true
        for (let c in selected_chaps.value) {
            if (!selected_chaps.value[c].html_parsed)
                return true
        }
        return false
    },
    set(){}
})

async function onLoadGetChapters() {
    const request = await browser.runtime.sendMessage(
        {cmd: "mainCreated"})
    if (request.action == "newChapList") {
        let chap_infos = JSON.parse(request.chaps)
        chaps.value = chap_infos.map((x: ChapterInfo) => {
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

function run_epub() {
    compile_epub(meta.value, selected_chaps.value, status_txt)
}

function onRowReorder(event: any) {
    chaps.value = event.value;
}

function onDelete(event:any) {
    chaps.value = chaps.value.filter(val => !selected_chaps.value.includes(val));
    selected_chaps.value = [];
}

function onCSV(event:any) {
    dt.value.exportCSV()
}

onMounted(async () => {
    try {
        // Load initial chapters
        await onLoadGetChapters()

        // Load Parser
        let parser_txt = await get_parsers_definitions()
        await SendSandboxCmdWReply(SbxCommand.LoadParsers,
            parser_txt)

        // Setup permanent message pipeline
        addSandboxListener(selected_chaps, status_txt);
        status_txt.value = "Loaded."
    } catch (error) {
        status_txt.value = "Error: " +
            ((error instanceof Error) ? error.message : String(error))
    }
})
</script>
