import browser from "webextension-polyfill";
import {iframe} from "./sidebar_win";
import {get_next_link, run_parse} from "./sidebar_parsing";

export async function msg_func(evt: any) {
    const data = evt.data

    switch (data.msg) {
        case 'PARSE_PAGE':
            await run_parse()
            break
        case 'LOAD_MAIN':
            await browser.storage.local.set({
                last_parse: {
                    chaps: data.chaps,
                    meta: data.meta,
                    parser: 'default'
                }
            })
            await browser.runtime.sendMessage({msg: "LOAD_MAIN"})
            break
        case 'SELECT_NEXT':
            get_next_link()
            break;
    }
}

export function reply_func(msg: any) {
    iframe.contentWindow?.postMessage(msg, '*' as WindowPostMessageOptions)
}
