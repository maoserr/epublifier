import browser from "webextension-polyfill";
import {onLoadGetChapters} from "./sidebar_parsing";
import {Chapter, NovelMetaData} from "../common/novel_data";

let baseMouseX: any, baseMouseY: any
let frameTop = 0
let frameLeft = 0
let cont: HTMLDivElement
let iframe: HTMLIFrameElement

function handleDragStart(evt: any) {

    baseMouseX = evt.offsetX
    baseMouseY = evt.offsetY

    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('mousemove', handleMousemove)
}

function handleMousemove(evt: any) {
    frameTop = evt.clientY - baseMouseY
    frameLeft = evt.clientX - baseMouseX
    cont.style.top = frameTop + 'px'
    cont.style.left = frameLeft + 'px'
}

function handleDragEnd() {
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('mousemove', handleMousemove)
}

function close() {
    window.removeEventListener('message', msg_func)
    iframe.contentWindow?.close()
    iframe.remove()
    cont.remove()
}

async function msg_func(evt: any) {
    const data = evt.data

    switch (data.msg) {
        case 'PARSE_PAGE':
            let s = new XMLSerializer();
            iframe.contentWindow?.postMessage({
                msg: 'PARSED_PAGE', source: s.serializeToString(document)
            }, '*' as WindowPostMessageOptions)
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
    }
}

export async function add_float_window(sb_id:string) {
    const src = browser.runtime.getURL('sidebar.html')
    const [chaps, meta]:[Chapter[],NovelMetaData] =
        await onLoadGetChapters()
    cont = document.createElement('div')
    cont.id = sb_id
    cont.style.display = "flex";
    cont.style.flexDirection = "column";
    cont.style.margin = "0";
    cont.style.padding = "0";
    cont.style.resize = "both";
    cont.style.overflow = "hidden";
    cont.style.height = "600px";
    cont.style.width = "500px";
    cont.style.position = "fixed";
    cont.style.top = "0px";
    cont.style.right = "0px";
    cont.style.zIndex = "9000000000000000000";
    cont.style.background = "#D3D3D3";
    cont.style.borderRadius = "5px";
    cont.style.border="1px solid black";
    document.body.appendChild(cont)

    let titlebar = document.createElement('div')
    titlebar.style.height = "40px";
    titlebar.style.color = "black";
    titlebar.style.padding = "5px";
    titlebar.textContent = meta.title?.slice(0,60);
    cont.appendChild(titlebar);
    let closebtn = document.createElement('div')
    closebtn.style.float = "right";
    closebtn.style.borderRadius = "50%";
    closebtn.style.marginRight = "8px";
    closebtn.style.opacity = "100";
    closebtn.style.height = "20px";
    closebtn.style.width = "20px";
    closebtn.style.backgroundColor = "#E96E4C";
    closebtn.onclick = () => close()
    titlebar.appendChild(closebtn)

    iframe = document.createElement('iframe');
    iframe.style.background = "white"
    iframe.style.flexGrow = "1";
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.margin = "0";
    iframe.style.padding = "0"
    cont.appendChild(iframe);

    setTimeout(async function () {
        iframe.src = src

        window.addEventListener('message', msg_func)
        titlebar.addEventListener('mousedown', handleDragStart)
    }, 0)
}
