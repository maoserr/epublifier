import browser from "webextension-polyfill";
import {msg_func} from "./sidebar_msgs";

let cont: HTMLDivElement
export let iframe: HTMLIFrameElement



export async function add_float_window(sb_id:string) {
    const src = browser.runtime.getURL('sidebar.html')

    iframe = document.createElement('iframe');
    cont.appendChild(iframe);

    setTimeout(async function () {
        iframe.src = src

        window.addEventListener('message', msg_func)
    }, 0)
}
