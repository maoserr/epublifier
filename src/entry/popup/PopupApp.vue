<template>
    <div id="app">
        <h5>Inputs</h5>
        <div class="field">
            <Message :closable=false>{{ status_txt }}
            </Message>
        </div>
        <div class="field">
            <label for="url">Page URL</label>
            <InputText id="url" type="text" v-model="url" class="w-full"/>
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
</template>

<script setup lang="ts">

import Message from 'primevue/message';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import {onMounted, ref} from 'vue'

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-light-indigo/theme.css';

import {extract_source} from './source_extract'
import {event_handler, parse_source } from './pop_messages'

const url = ref("")
const status_txt = ref("Loading...")
const src = ref('')

let iframe: HTMLIFrameElement;

function first_chap() {

}

function chap_list() {

}

onMounted(async () => {
    status_txt.value = "Done"
    iframe = document.getElementById("sandbox") as HTMLIFrameElement;
    window.addEventListener('message',
        (event)=>event_handler(status_txt, event))

    // Source extraction
    let res = await extract_source()
    console.debug(res)
    url.value = res.url
    if ('error' in res) {
        status_txt.value = `Error: ${res.error}`
    } else {
        src.value = res.source
        status_txt.value = "Source parsed."
    }

    // Parser Loading
    let pres = parse_source(iframe,url.value, src.value)
    if (pres != "success") {
        status_txt.value = pres
    }
})
</script>

<style>
body {
    width: 700px;
    min-height: 550px;
    color: var(--text-color);
    background-color: var(--surface-card);
    padding: 1.5rem;
}
</style>
