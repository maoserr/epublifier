import browser from "webextension-polyfill";

function load_main(e:any) {
    if (e.msg==='LOAD_MAIN') {
        browser.windows.create({
            url: "main.html",
            type: "popup",
        }).then();
    }
}
browser.runtime.onMessage.addListener(load_main)
