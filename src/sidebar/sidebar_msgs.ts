import browser from "webextension-polyfill";
import {iframe} from "./sidebar_win";
import {
    get_next_link,
    get_title_link,
    run_parse,
    set_next
} from "./sidebar_parsing";
import {meta} from "./sidebar_win"

export async function msg_func(evt: any) {
    const data = evt.data

    switch (data.msg) {
        case 'PARSE_PAGE':
            await run_parse(data.max_chaps, data.wait_s, data.scroll)
            break
        case 'LOAD_MAIN':
            await browser.storage.local.set({
                last_parse: {
                    chaps: data.chaps,
                    meta: JSON.stringify(meta),
                    parser: 'default'
                }
            })
            await browser.runtime.sendMessage({msg: "LOAD_MAIN"})
            break
        case 'SELECT_NEXT':
            get_next_link()
            break;
        case 'SELECT_TITLE':
            get_title_link()
            break;
        case 'SET_NEXT':
            set_next(data.value)
            break;
    }
}

export function reply_func(msg: any) {
    iframe.contentWindow?.postMessage(msg, '*' as WindowPostMessageOptions)
}
