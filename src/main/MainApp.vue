<template>
    <div class="grid" style="width:100%">
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
                            <InputText id="title" v-model="meta.title"/>
                        </div>
                        <div class="field col-4">
                            <label for="author">Author:</label>
                            <InputText id="author" v-model="meta.author"/>
                        </div>
                        <div class="field col-4">
                            <label for="publisher">Publisher:</label>
                            <InputText id="publisher" v-model="meta.publisher"/>
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
                <TabPanel header="Preview Chap">
                    <iframe :srcdoc="selected_chaps[0]?.html_parsed || 'No data'"
                            id="preview"></iframe>
                </TabPanel>
                <TabPanel header="Edit Chap">
                    <span v-if="selected_chaps.length==0">No chapter selected</span>
                    <div v-if="selected_chaps.length>0">
                        <InputText id="chap_title" v-model="selected_chaps[0].title"></InputText>
                        <Textarea v-model="selected_chaps[0].html_parsed"
                                  style="width: 100%; max-width: 100%; height: 70vh"/>
                    </div>
                </TabPanel>
                <TabPanel header="Original Chap">
                    <iframe :srcdoc="selected_chaps[0]?.html || 'No data'" id="preview"></iframe>
                </TabPanel>
            </TabView>
        </div>
        <div class="col-6">

            <Toolbar>
                <template #start>
                    <Button label="New" icon="pi pi-plus" class="mr-2" rounded raised/>
                    <Button icon="pi pi-times" @click="onDelete" class="mr-2" severity="danger" rounded raised/>
                    <Button label="CSV" @click="$refs.dt.exportCSV()" icon="pi pi-download" rounded raised/>
                </template>

                <template #end>
                    <Button :label="parse_label" icon="pi pi-play" class="mr-2"
                            @click="run_parsers" :disabled="parse_disable" rounded raised/>
                    <Button label="Epub" icon="pi pi-download" severity="success"
                            @click="run_epub" :disabled="epub_disable" rounded raised/>
                </template>
            </Toolbar>
            <ProgressBar :value="progress" :show-value="false"></ProgressBar>
            <DataTable :value="chaps" ref="dt"
                       v-model:selection="selected_chaps"
                       :reorderableColumns="true"
                       @rowReorder="chaps = $event.value"
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
                            {{ (data as any).info.url?.slice(0, 25) }}...</a>
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

import {Chapter, ChapterInfo, NovelMetaData} from "../common/novel_data";
import {parse_chaps, compile_epub, addSandboxListener} from "./parse_main"
import {get_parsers_definitions} from "../common/parser_manager";
import {SendSandboxCmdWReply} from "../sandboxed/send_message";
import {SbxCommand} from "../sandboxed/messages";


const status_txt = ref("Loading...")
const meta = ref({title: 'N/A', description: 'N/A'} as NovelMetaData)
const chaps = ref([] as Chapter[])
const selected_chaps = ref([] as Chapter[])
const progress = ref(0)
const dt = ref();
const running = ref(false)
const cancel = ref(false)
const parse_label = computed({
    get() {
        if (running.value) {
            return "Cancel"
        }
        return "Parse"
    },
    set() {
    }
})
const parse_disable = computed({
    get() {
        return selected_chaps.value.length == 0
    },
    set() {
    }
})
const epub_gen = ref(false)
const epub_disable = computed({
    get() {
        if (running.value) {
            return true
        }
        if (epub_gen.value) {
            return true
        }
        if (selected_chaps.value.length == 0)
            return true
        for (let c in selected_chaps.value) {
            if (!selected_chaps.value[c].html_parsed)
                return true
        }
        return false
    },
    set() {
    }
})

async function onLoadGetChapters() {
    const load_config = await browser.storage.local.get('last_parse')
    const last_parse = load_config.last_parse
    chaps.value = JSON.parse(last_parse.chaps)
    meta.value = JSON.parse(last_parse.meta)
}

async function run_parsers() {
    if (running.value) {
        cancel.value = true
    } else {
        console.log("Parsing...")
        running.value = true
        await parse_chaps(selected_chaps.value, meta.value, cancel, status_txt, progress)
        running.value = false
        cancel.value = false
    }
}

async function run_epub() {
    if (epub_gen.value) {
        return
    }
    epub_gen.value = true
    await compile_epub(meta.value, selected_chaps.value, status_txt)
    epub_gen.value = false
}

function onDelete(event: any) {
    chaps.value = chaps.value.filter(val => !selected_chaps.value.includes(val));
    selected_chaps.value = [];
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
