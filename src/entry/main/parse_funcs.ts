import {Chapter, ChapterInfo, NovelMetaData} from "../../common/novel_data";
import * as Parallel from 'async-parallel';
import browser from "webextension-polyfill";
import {Ref} from "vue";

export function addSandboxListener(chaps: Chapter[], status_txt: Ref<string>) {
    window.addEventListener('message', function (event) {
        let command = event.data.command;
        status_txt.value = event.data.message;
        switch (command) {
            case 'chap':
                let id = event.data.id;
                let title = event.data.title;
                let html = event.data.html;
                chaps[id].html_parsed = html;
                chaps[id].title = title;
                break;
            case 'epub_file':
                console.log(event)
                let filecontent = event.data.file;
                browser.downloads.download({
                    url: URL.createObjectURL(filecontent),
                    filename: event.data.filename,
                });
        }
    });
}

export async function parse_chaps(chaps: Chapter[],
                                  meta: NovelMetaData,
                                  status_txt: Ref<string>,
                                  progress_val: Ref<number>) {
    let cnt_slice = 100.0 / chaps.length;
    progress_val.value = 0;
    let extract_chap = async function (id: number) {
        try {
            if (chaps[id].info.url != "none") {
                let f_res = await fetch(chaps[id].info.url)
                let f_txt = await f_res.text()
                chaps[id].html = f_txt;
                status_txt.value = "Parsing chapter content: " + id;
                let iframe: HTMLIFrameElement = document.getElementById("sandbox") as HTMLIFrameElement;
                iframe.contentWindow?.postMessage({
                    command: "parse",
                    // parser: JSON.stringify(vm.parsers),
                    doc: f_txt,
                    id: id,
                    chap: JSON.stringify(chaps[id])
                }, '*');
            } else {
                // Is a single page book, no additional parsing needed.
            }
        } catch (e) {
            status_txt.value = "Unable to parse content: " + e;
            console.log(e)
        }
        progress_val.value += cnt_slice;
    }
    await Parallel.each(Array.from(Array(chaps.length).keys()), async id => {
        await extract_chap(id)
    }, 3);
}

export function compile_epub() {

}
