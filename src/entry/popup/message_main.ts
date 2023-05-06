import browser from "webextension-polyfill";

function newTabEventToc(request: any, sender: any, sendResponse: any) {
    if (('cmd' in request) && (request.cmd == "mainCreated")) {
        browser.runtime.onMessage.removeListener(newTabEventToc)
        let tab_msg = {
            action: "newChapList",
            chaps: JSON.stringify(chaps.value),
            metadata: JSON.stringify(meta.value),
            parser: parser.value?.parse_doc
        }
        sendResponse(tab_msg);
    }
}

function newTabEventChap(request: any, sender: any, sendResponse: any) {
    if (('cmd' in request) && (request.cmd == "mainCreated")) {
        browser.runtime.onMessage.removeListener(newTabEventToc)
        let tab_msg = {
            action: "newChapList",
            chaps: JSON.stringify(chaps.value),
            metadata: JSON.stringify(meta.value),
            parser: parser.value?.parse_doc
        }
        sendResponse(tab_msg);
    }
}

function setup_firstchap(){
    browser.runtime.onMessage.addListener(newTabEventChap)
}

function setup_chaplist(){
    browser.runtime.onMessage.addListener(newTabEventToc)
    await browser.storage.local.set()
}
