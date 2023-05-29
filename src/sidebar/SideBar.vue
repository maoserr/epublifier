<template>
    <div>
        <Button label="Parse" @click="parse" icon="pi pi-book"/>
        <Button label="Load Chapters" @click="load_main" icon="pi pi-book"/>
        <iframe title="Preview" :srcdoc="text"
                style="border-width: 1px;width: 100%;height: 75vh;overflow: auto;"></iframe>
        <ol>
            <li v-for="item in chaps">
                {{ item?.title }}: <a target="_blank" :href="item?.url">{{ item?.url }}</a>
            </li>
        </ol>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import {ref} from "vue";
import {Readability} from "@mozilla/readability";
import {Chapter, ChapterInfo} from "../common/novel_data";

const title = ref<string>('')
const text = ref<string>('')
const chaps = ref<Chapter[]>([])

window.addEventListener('message', (evt: any) => {
    const data = evt.data
    switch (data.msg) {
        case 'PARSED_PAGE':
            let parser = new DOMParser();
            let dom = parser.parseFromString(data.source, "text/html");
            let out = new Readability(dom).parse()
            text.value = out?.content ?? "";
            title.value = out?.title ?? "";
            chaps.value.push({
                info: {title: 'N/A', url: 'N/A', parser: 'N/A', parse_doc: 'N/A'} as ChapterInfo
                , title: title.value, html: data.source, html_parsed: text.value
            } as Chapter)
            break;
    }
})

function parse(evt: any) {
    window.parent.postMessage({
        msg: 'PARSE_PAGE'
    }, '*' as WindowPostMessageOptions)
}

function load_main(evt: any) {
    window.parent.postMessage({
        msg: 'LOAD_MAIN',
        chaps: JSON.stringify(chaps.value),
        meta: JSON.stringify({title:'N/A', description:'N/A'})
    }, '*' as WindowPostMessageOptions)
}
</script>

<style>
</style>
