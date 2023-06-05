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

// function complete_req(e:any){
//     console.log(e)
// }
//
// browser.webRequest.onBeforeRequest.addListener(
//     complete_req,
//     {urls:['<all_urls>']})
//
// browser.webRequest.onCompleted.addListener(
//     complete_req,
//     {urls:['<all_urls>']})
