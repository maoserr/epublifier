import browser from "webextension-polyfill";
import {ChapterInfo, NovelMetaData} from "../../common/novel_data";
import {ParserDocDef} from "../../common/parser_types";

async function add_float_window(src: string) {
    let cont = document.createElement('div')
    cont.style.display = "flex";
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
    document.body.appendChild(cont)

    //.resizer { display:flex; margin:0; padding:0; resize:both; overflow:hidden }
    // .resizer > .resized { flex-grow:1; margin:0; padding:0; border:0 }
    //
    // .ugly { background:red; border:4px dashed black; }

    let iframe = document.createElement('iframe');
    iframe.style.border = "0";
    iframe.style.flexGrow = "1";
    iframe.style.margin = "0";
    iframe.style.padding = "0"
    cont.appendChild(iframe);

    setTimeout(function() {
        const iframdoc = iframe.contentDocument!
        iframdoc.body.style.resize = "both"
        const app = iframdoc.createElement('div')
        app.id = 'app'
        iframdoc.body.appendChild(app)
        const script = iframdoc.createElement('script')
        script.src = src
        iframdoc.head.appendChild(script)
        let pageMouseX:any, pageMouseY:any

        let frameTop = 0
        let frameLeft = 0

        window.addEventListener('message', evt => {
            const data = evt.data

            switch (data.msg) {
                case 'SALADICT_DRAG_START':
                    handleDragStart(data.mouseX, data.mouseY)
                    break
                case 'SALADICT_DRAG_MOUSEMOVE':
                    handleFrameMousemove(data.offsetX, data.offsetY)
                    break
                case 'SALADICT_DRAG_END':
                    handleDragEnd()
                    break
                case 'SALADICT_CLOSE':
                    iframe.remove()
                    break
            }
        })

        function handleDragStart (mouseX:any, mouseY:any) {
            // get the coordinates within the upper frame
            pageMouseX = frameLeft + mouseX
            pageMouseY = frameTop + mouseY

            document.addEventListener('mouseup', handleDragEnd)
            document.addEventListener('mousemove', handlePageMousemove)
        }

        function handleDragEnd () {
            document.removeEventListener('mouseup', handleDragEnd)
            document.removeEventListener('mousemove', handlePageMousemove)
        }

        function handleFrameMousemove (offsetX:any, offsetY:any) {
            frameTop += offsetY
            frameLeft += offsetX
            cont.style.top = frameTop + 'px'
            cont.style.left = frameLeft + 'px'

            // Add the missing coordinates
            pageMouseX += offsetX
            pageMouseY += offsetY
        }

        function handlePageMousemove (evt:any) {
            frameTop += evt.clientX - pageMouseX
            frameLeft += evt.clientY - pageMouseY
            cont.style.top = frameTop + 'px'
            cont.style.left = frameLeft + 'px'

            pageMouseX = evt.clientX
            pageMouseY = evt.clientY
        }
    },0)
}

export async function setup_main(toc: boolean,
                                 chaps: ChapterInfo[],
                                 meta: NovelMetaData,
                                 parser: ParserDocDef) {
    if (toc) {
        await browser.storage.local.set(
            {
                last_parse: {
                    chaps: JSON.stringify(chaps),
                    meta: JSON.stringify(meta),
                    parser: parser.parse_doc
                }
            }
        )
        await browser.windows.create({
            url: "main.html",
            type: "popup",
        });
        window.close()
    } else {
        let curr_tab = await browser.tabs.query(
            {active: true})
        await browser.tabs.create({
            url: "main.html",
            active: false
        });
        const url = browser.runtime.getURL('js/sidebar.js')
        await browser.scripting.executeScript(
            {
                target: {tabId: curr_tab[0].id!},
                func: add_float_window,
                args: [url]
            }
        )
        window.close()
    }
}
