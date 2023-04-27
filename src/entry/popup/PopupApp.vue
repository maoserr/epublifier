<template>
    <div id="app" class="grid">
        <div class="col-12">
            <Message :closable=false>{{ status_txt }}
            </Message>
        </div>
        <div class="col-12">
            <div style="float:right" class="flex gap-2">
                <Button label="First Chapter" @click="first_chap"
                        icon="pi pi-file"/>
                <Button label="Load Chapters" @click="chap_list"
                        icon="pi pi-book"/>
            </div>
        </div>
        <div class="col-12">
            <TabView>
                <TabPanel header="Metadata">
                    <div class="grid">
                        <div class="col-2"><b>Title</b></div>
                        <div class="col-10">{{ meta?.title }}</div>
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
            </TabView>
        </div>
    </div>
</template>

<style>
body {
    width: 700px;
    min-height: 550px;
}
</style>

<script setup lang="ts">
import Message from 'primevue/message';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import {onMounted, ref} from 'vue'

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {extract_source} from './source_extract'
import {SbxCommand, SendSandboxCmdWReply} from "../../common/sandbox_util";
import {get_parsers} from "../../common/parser_manager";
import {ChapterInfo, NovelMetaData} from "../../common/novel_data";
import browser from "webextension-polyfill";

// App data
const url = ref("N/A")
const status_txt = ref("Loading...")
const src = ref('')

// Novel data
const meta = ref({title: 'N/A', description: 'N/A'} as NovelMetaData)
const chaps = ref([] as ChapterInfo[])
const parser = ref('')

function newTabEvent(request: any, sender: any, sendResponse: any) {
    if (('cmd' in request) && (request.cmd == "mainCreated")) {
        browser.runtime.onMessage.removeListener(newTabEvent)
        let tab_msg = {
            action: "newChapList",
            chaps: JSON.stringify(chaps.value),
            metadata: JSON.stringify(meta.value),
            parser: parser.value
        }
        sendResponse(tab_msg);
    }
}

function first_chap() {

}

/**
 * Loads chapter list page
 */
async function chap_list() {
    browser.runtime.onMessage.addListener(newTabEvent)
    await browser.tabs.create({url: "main.html", active: true});
}

onMounted(async () => {
    try {
        // Source extraction
        let res = await extract_source()
        url.value = res.url
        src.value = res.source
        status_txt.value = "Source parsed."

        // Load Parser
        let parser_txt = await get_parsers()
        await SendSandboxCmdWReply(SbxCommand.LoadParsers,
            parser_txt)
        // Run Parser
        let pres = await SendSandboxCmdWReply(SbxCommand.ParseSource,
            {inputs: {}, url: url.value, src: src.value})
        status_txt.value = pres.message
        meta.value = pres.data.meta
        chaps.value = pres.data.chaps
        parser.value = pres.data.parse_doc
    } catch (error) {
        status_txt.value = "Error: " +
            ((error instanceof Error) ? error.message : String(error))
    }
})
</script>

