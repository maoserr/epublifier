<template>
    <div id="app">
        <h2>Inputs</h2>
        <div class="field">
            <Message :closable=false>{{ status_txt }}
            </Message>
        </div>
        <div class="field">
            <span>URL: {{ url }}</span>
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
import {onMounted, ref} from 'vue'

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {extract_source} from './source_extract'
import {parse_source, parser_load} from './pop_messages'

const url = ref("")
const status_txt = ref("Loading...")
const src = ref('')

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
        let pars = await parser_load()
        // Run Parser
        status_txt.value = await parse_source(url.value, src.value)
    } catch (error) {
        status_txt.value = "Error: " +
            ((error instanceof Error) ? error.message : String(error))
    }
})
</script>

<style>
html {
    font-size: 14px;
}

body {
    font-size: 14px;
    width: 700px;
    min-height: 550px;
    color: var(--text-color);
    background-color: var(--surface-card);
    padding: 1.5rem;
}
</style>
