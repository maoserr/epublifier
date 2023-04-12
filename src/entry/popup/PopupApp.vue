<template>
    <div id="app">
        <div class="card">
            <h5>Inputs</h5>
            <div class="field">
                <Message :closable=false>{{ status_txt }}
                </Message>
            </div>
            <div class="field">
                <label for="url">Page URL</label>
                <div class="p-inputgroup flex-1">
                    <InputText id="url" type="text" v-model="url" class="w-full"/>
                    <Button @click="update_src()" icon="pi pi-search" severity="warning"/>
                </div>
            </div>
            <div class="field">
                <label>Parser:</label>
                <Dropdown class="w-full"/>
            </div>
            <div class="field">
                <Button label="Treat as first chapter" @click="first_chap"
                        class="p-button-success w-full" icon="pi pi-check"/>
            </div>
            <div class="field">
                <Button label="Load Chapter List" @click="chap_list"
                        class="p-button-success w-full" icon="pi pi-check"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import Message from 'primevue/message';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import {onMounted, ref} from 'vue'

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

import {browser} from "../../common/browser_utils";
import {extract_source} from './source_extract'

const url = ref("https://www.test.com")
const status_txt = ref("Loading...")
const src = ref('')
let iframe: HTMLIFrameElement;

function first_chap() {

}

function chap_list() {

}

function event_handler(event: any) {
    if (event.origin !== window.location.origin)
        return;
    let command = event.data.command;
    switch (command) {
        case 'toc':
            status_txt.value = event.data.message;
            break;
        case 'fetch':
            break;
        default:
            break;
    }
}

async function update_src(){
    src.value = await extract_source(url.value)
    console.log(src.value)
}

async function parse_source(){
    try {
        iframe.contentWindow!.postMessage({
            command: "parse",

            },
            window.location.origin)
    } catch(e) {
        status_txt.value = "Unable to parse content: "+ e;
    }
}

onMounted(async () => {
    url.value = window.location.href
    status_txt.value = "Done"
    iframe = document.getElementById("sandbox") as HTMLIFrameElement;
    window.addEventListener('message', event_handler)
    if (browser !== undefined) {
        src.value = await extract_source()
        status_txt.value = "Source parsed."
    }
})
</script>

<style>
body {
    width: 700px;
    min-height: 550px;
    color: var(--text-color)
}

.card {
    background-color: var(--surface-card);
    padding: 1.5rem;
    -webkit-box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%), 0 1px 1px 0 rgb(0 0 0 / 14%), 0 1px 3px 0 rgb(0 0 0 / 12%);
    box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%), 0 1px 1px 0 rgb(0 0 0 / 14%), 0 1px 3px 0 rgb(0 0 0 / 12%);
    border-radius: 4px;
    margin: 2rem 0;
}
</style>
