import {Chapter, NovelData, NovelMetaData} from "../../common/novel_data";
import * as Parallel from 'async-parallel';
import browser from "webextension-polyfill";
import {Ref} from "vue";
import {SbxCommand, SbxReply, SbxResult} from "../sandboxed/messages";
import {SendSandboxCmd, SetupSbxListener} from "../sandboxed/send_message";
import {ParserResultChap} from "../../common/parser_types";
import {generate_epub} from "../../common/epub_generator";

export function addSandboxListener(chaps: Ref<Chapter[]>, status_txt: Ref<string>) {
    SetupSbxListener((err: string) => {
            console.error(err);
            status_txt.value = err
        },
        (data: SbxResult<ParserResultChap | NovelData>) => {
            if (data.reply == SbxReply.Chap) {
                let this_chap = data.data as ParserResultChap
                let id = this_chap.id;
                let title = this_chap.title;
                chaps.value[id].html_parsed = this_chap.html;
                if (title !== undefined)
                    chaps.value[id].title = title;
                console.log(data.message)
                status_txt.value = "Chapter " + chaps.value[id].title + ": " + data.message;
            }
        }
    )
}

export async function parse_chaps(chaps: Chapter[],
                                  meta: NovelMetaData,
                                  cancel: Ref<boolean>,
                                  status_txt: Ref<string>,
                                  progress_val: Ref<number>) {
    let cnt_slice = 100.0 / chaps.length;
    progress_val.value = 0;
    let extract_chap = async function (id: number) {
        if (cancel.value){
            throw new Error('User cancelled')
        }
        if (chaps[id].info.url != "none") {
            let f_res
            let f_txt = ''
            try {
                f_res = await fetch(chaps[id].info.url);
                f_txt = await f_res.text();
            }catch (e) {
                status_txt.value = "Can't download. Please check permissions in extension page "
                    + "-> permission -> Access your data for all websites"
                return
            }
            chaps[id].html = f_txt;
            status_txt.value = "Parsing chapter content: " + id;
            SendSandboxCmd(SbxCommand.ParseChapter, {
                inputs: {},
                doc: f_txt,
                id: id,
                chap: JSON.stringify(chaps[id])
            })
        }
        progress_val.value += cnt_slice;
    }
    try {
        await Parallel.each(Array.from(Array(chaps.length).keys()), async id => {
            await extract_chap(id)
        }, 3);
    } catch (e) {
        status_txt.value = "Error: "+e
        console.log(e)
    }
}

export async function compile_epub(meta: NovelMetaData,
                                   chaps: Chapter[],
                                   status_txt: Ref<string>) {
    let nov_data: NovelData = {
        meta: meta,
        chapters: chaps,
        filename: meta.title.toLowerCase().replaceAll(/[\W_]+/g, "_") + ".epub"
    }
    if (meta.cover != null) {
        let response = await fetch(meta.cover);
        if (response.ok) {
            nov_data.cover = await response.blob();
        }
    }
    const filecontent = await generate_epub(nov_data, (msg: string) => {
        status_txt.value = msg
    })
    if (filecontent === undefined) {
        status_txt.value = "No file generated."
        return
    }
    await browser.downloads.download({
        url: URL.createObjectURL(filecontent),
        filename: nov_data.filename,
    });
}
