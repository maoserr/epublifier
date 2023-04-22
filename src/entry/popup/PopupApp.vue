<template>
    <div id="app" class="grid">
        <div class="col-12">
            <Message :closable=false>{{ status_txt }}
            </Message>
        </div>
        <div class="col-12">
            <Button label="Treat as first chapter" @click="first_chap"
                    class="p-button-success" icon="pi pi-check"/>
            <Button label="Load Chapter List" @click="chap_list"
                    class="p-button-success" icon="pi pi-check"/>
        </div>
        <div class="col-12">
            <TabView>
                <TabPanel header="Metadata">
                    <div class="grid">
                        <div class="col-2"><b>Title</b></div>
                        <div class="col-10">{{ meta.title }}</div>
                        <div class="col-2"><b>Publisher</b></div>
                        <div class="col-10">{{ meta.publisher }}</div>
                        <div class="col-2"><b>URL</b></div>
                        <div class="col-10">{{ url }}</div>
                        <div class="col-12">
                            <h4>Description:</h4>
                            <img id="cover" width="200" style="float:left;margin:10px"
                                 :src="meta.cover" alt="cover"/>
                            <span v-html="meta.description"></span>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Chapters">
                    <h4>Chapters:</h4>
                </TabPanel>
            </TabView>
        </div>
    </div>
</template>

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
import {NovelMetaData} from "../../common/novel_data";

// App data
const url = ref("")
const status_txt = ref("Loading...")
const src = ref('')

// Novel data
const meta = ref({title: 'Loading...', description: 'Loading...'} as NovelMetaData)

function first_chap() {

}

function chap_list() {

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
    } catch (error) {
        status_txt.value = "Error: " +
            ((error instanceof Error) ? error.message : String(error))
    }
})
</script>
