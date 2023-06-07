import browser from "webextension-polyfill";
import {Chapter, NovelMetaData} from "../common/novel_data";
import {reply_func} from "./sidebar_msgs";


let overlay: HTMLDivElement
let all_els: HTMLElement[] = []

export async function onLoadGetChapters(): Promise<[Chapter[], NovelMetaData]> {
    const load_config = await browser.storage.local.get('last_parse')
    const last_parse = load_config.last_parse
    return [JSON.parse(last_parse.chaps), JSON.parse(last_parse.meta)]
}

function get_next_move(e: any) {
    all_els = (document.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[])
        .filter(x => x != overlay)
        .filter(x => (x.tagName === "BUTTON"
            || x.tagName === "A"
            || (x.onclick != null)
        ),)
}

function stop_get_next(e: any) {
    reply_func({msg: 'SELECTED_NEXT', els: all_els.length})
    overlay.remove()
    document.removeEventListener('mousemove', get_next_move)
    document.removeEventListener('mousedown', stop_get_next)
}

export function get_next_link() {
    overlay = document.createElement('div')
    overlay.style.backgroundColor = 'rgba(1, 1, 1, 0.7)'
    overlay.style.bottom = "0"
    overlay.style.left = "0"
    overlay.style.position = "fixed"
    overlay.style.right = "0"
    overlay.style.top = "0"
    overlay.style.zIndex = "9000000000000000000"
    document.body.appendChild(overlay)
    document.addEventListener('mousemove', get_next_move)
    document.addEventListener('mousedown', stop_get_next)
}

export async function run_parse(max_chaps:number, wait_s:number, scroll: boolean) {

    let s = new XMLSerializer();
    for (let i=0; i<max_chaps; i++) {
        let src = s.serializeToString(document)
        reply_func({msg: 'PARSED_PAGE', source: src})
        if (all_els.length == 0) {
            break
        }
        all_els[0].click()
        await new Promise(f => setTimeout(f, Math.round(wait_s*1000)));
        if (scroll) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(f => setTimeout(f, Math.round(wait_s*1000)));
        }
    }
}
