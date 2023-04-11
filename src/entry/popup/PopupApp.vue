<template>
    <div id="app" class="grid">
        <div class="card">
            <h5>Inputs</h5>
            <div class="field">
                <Message :closable=false>{{ status_txt }}
                </Message>
            </div>
            <div class="field">
                <label for="url">Page URL</label>
                <InputText id="url" type="text" :value="url" class="w-full"/>
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

const url = ref("https://www.test.com")
const status_txt = ref("Loading...")

function first_chap() {

}

function chap_list() {

}

function event_handler(event: any) {
    let command = event.data.command;
    status_txt.value = event.data.message;


}

onMounted(() => {
    url.value = "test"
    status_txt.value = "Done"
    window.addEventListener('message', event_handler)
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
