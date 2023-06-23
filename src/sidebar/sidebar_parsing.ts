import browser from "webextension-polyfill";
import {Chapter, NovelMetaData} from "../common/novel_data";
import {reply_func} from "./sidebar_msgs";


let overlay: HTMLDivElement
let all_els: HTMLElement[] = []
let tit_els: HTMLElement[] = []
let next_opt = 'click'

export async function onLoadGetChapters(): Promise<[Chapter[], NovelMetaData]> {
    const load_config = await browser.storage.local.get('last_parse')
    const last_parse = load_config.last_parse
    return [JSON.parse(last_parse.chaps), JSON.parse(last_parse.meta)]
}

function get_next_move(e: any) {
    all_els = (document.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[])
        .filter(x => x != overlay)
        .filter(x => (x.tagName.toUpperCase() === "BUTTON"
            || x.tagName.toUpperCase() === "A"
            || (x.onclick != null)
        ),)
}

function get_title_move(e: any) {
    tit_els = (document.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[])
        .filter(x => x != overlay)
        .filter(x => (x.tagName.toUpperCase().match(/H\d/i)
            || x.tagName.toUpperCase() === "EM"
        ),)
}

function stop_get_next(e: any) {
    reply_func({msg: 'SELECTED_NEXT', els: all_els.length})
    overlay.remove()
    document.removeEventListener('mousemove', get_next_move)
    document.removeEventListener('mousedown', stop_get_next)
}


function stop_get_title(e: any) {
    reply_func({msg: 'SELECTED_NEXT', els: tit_els.length})
    overlay.remove()
    document.removeEventListener('mousemove', get_title_move)
    document.removeEventListener('mousedown', stop_get_title)
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

export function get_title_link() {
    overlay = document.createElement('div')
    overlay.style.backgroundColor = 'rgba(1, 1, 1, 0.7)'
    overlay.style.bottom = "0"
    overlay.style.left = "0"
    overlay.style.position = "fixed"
    overlay.style.right = "0"
    overlay.style.top = "0"
    overlay.style.zIndex = "9000000000000000000"
    document.body.appendChild(overlay)
    document.addEventListener('mousemove', get_title_move)
    document.addEventListener('mousedown', stop_get_title)
}

export function set_next(nxt_opt: string) {
    next_opt = nxt_opt
}

export async function run_parse(max_chaps: number, wait_s: number, scroll: boolean) {

    let s = new XMLSerializer();
    for (let i = 0; i < max_chaps; i++) {
        let src = s.serializeToString(document)
        let title = ""
        if (tit_els.length > 0) {
            title = tit_els[0].innerText
        }
        reply_func({msg: 'PARSED_PAGE', source: src, title: title, status:"Testa"})
        if (next_opt === "click") {
            if (all_els.length == 0) {
                break
            }
            all_els[0].click()
        } else if (next_opt === "right") {

        } else if (next_opt === "down") {

        }
        await new Promise(f => setTimeout(f, Math.round(wait_s * 1000)));
        if (scroll) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(f => setTimeout(f, Math.round(wait_s * 1000)));
        }
    }
}
