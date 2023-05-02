<template>
    <div id="app">
        <div class="grid">
            <div class="col-12">
                <Message :closable=false>{{ status_txt }}
                </Message>
            </div>
            <div class="col-12">
                <div style="float:right" class="flex gap-2">
                    <Button label="First Chapter" @click="first_chap"
                            :disabled="parser_type != 'chap'"
                            icon="pi pi-file"/>
                    <Button label="Load Chapters" @click="chap_list"
                            :disabled="parser_type != 'toc'"
                            icon="pi pi-book"/>
                </div>
            </div>
            <div class="col-12">
                <TabView>
                    <TabPanel header="Metadata">
                        <div class="grid">
                            <div class="col-2"><b>Title</b></div>
                            <div class="col-10">{{ meta?.title }}</div>
                            <div class="col-2"><b>Author</b></div>
                            <div class="col-10">{{ meta?.author }}</div>
                            <div class="col-2"><b>Publisher</b></div>
                            <div class="col-10">{{ meta?.publisher }}</div>
                            <div class="col-2"><b>URL</b></div>
                            <div class="col-10">{{ url }}</div>
                            <div class="col-12">
                                <h4>Description:</h4>
                                <img v-if="meta?.cover" id="cover" width="200" style="float:left;margin:10px"
                                     :src="meta?.cover" alt="cover"/>
                                <span v-html="meta?.description"></span>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header="Chapters">
                        <ol>
                            <li v-for="item in chaps">
                                {{ item?.title }}: <a target="_blank" :href="item?.url">{{ item?.url }}</a>
                            </li>
                        </ol>
                    </TabPanel>
                    <TabPanel header="Parsing">
                        <div>
                            <Button label="Re-Parse" @click="reparse"
                                    icon="pi pi-file"/>
                            <Listbox v-model="parser" :options="parsers"
                                     optionLabel="parser" listStyle="max-height:12rem"/>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    </div>
</template>

<style>
html {
    width: 700px;
    min-height: 550px;
}
</style>

<script setup lang="ts">
import Message from 'primevue/message';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Listbox from 'primevue/listbox';

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {computed, onMounted, ref} from 'vue'
import browser from "webextension-polyfill";
import {extract_source} from './source_extract'
import {SbxCommand, SbxResult} from "../sandboxed/messages";
import {SendSandboxCmdWReply} from "../sandboxed/send_message";
import {get_parsers_definitions} from "../../common/parser_manager";
import {ChapterInfo, NovelMetaData} from "../../common/novel_data";
import {ParserDocDef, ParserResultAuto, ParserResultToc} from "../../common/parser_types";

// App data
const url = ref("N/A")
const status_txt = ref("Loading...")
const src = ref('')

// Novel data
const meta = ref({title: 'N/A', description: 'N/A'} as NovelMetaData)
const chaps = ref([] as ChapterInfo[])

const parser = ref()
const parser_type = ref()
const parsers = ref([])

function newTabEventToc(request: any, sender: any, sendResponse: any) {
    if (('cmd' in request) && (request.cmd == "mainCreated")) {
        browser.runtime.onMessage.removeListener(newTabEventToc)
        let tab_msg = {
            action: "newChapList",
            chaps: JSON.stringify(chaps.value),
            metadata: JSON.stringify(meta.value),
            parser: parser.value
        }
        sendResponse(tab_msg);
    }
}

function newTabEventChap(request: any, sender: any, sendResponse: any){
    if (('cmd' in request) && (request.cmd == "mainCreated")) {
        browser.runtime.onMessage.removeListener(newTabEventToc)
        let tab_msg = {
            action: "newChapList",
            chaps: JSON.stringify(chaps.value),
            metadata: JSON.stringify(meta.value),
            parser: parser.value
        }
        sendResponse(tab_msg);
    }
}

async function first_chap() {
    browser.runtime.onMessage.addListener(newTabEventChap)
    await browser.tabs.create({url: "main.html", active: true});
}

/**
 * Loads chapter list page
 */
async function chap_list() {
    browser.runtime.onMessage.addListener(newTabEventToc)
    await browser.tabs.create({url: "main.html", active: true});
}

function reparse(){
    
}

onMounted(async () => {
    try {
        // Source extraction
        const res = await extract_source()
        url.value = res.url
        src.value = res.source
        status_txt.value = "Source parsed."

        // Load Parser
        const parser_txt = await get_parsers_definitions()
        const parsedefs_rep:SbxResult<any> = await SendSandboxCmdWReply(
            SbxCommand.LoadParsers, parser_txt)
        status_txt.value = parsedefs_rep.message
        parsers.value = parsedefs_rep.data

        // Run Parser
        const pres = await SendSandboxCmdWReply(SbxCommand.ParseSource,
            {inputs: {}, url: url.value, src: src.value})
        status_txt.value = pres.message
        const auto_res = pres.data as ParserResultAuto
        parser.value = auto_res.parse_doc
        parser_type.value = auto_res.type
        if (auto_res.type === 'toc') {
            const toc_res = auto_res.result as ParserResultToc
            meta.value = toc_res.meta
            chaps.value = toc_res.chaps

        }
    } catch (error) {
        status_txt.value = "Error: " +
            ((error instanceof Error) ? error.message : String(error))
    }
})
</script>

