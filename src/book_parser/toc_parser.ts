import browser from "webextension-polyfill";

export function load_parsers(){
    return fetch(browser.runtime.getURL("config/default.yaml")).then(r=>r.text()).then(result=>{
        return result;
    })
}
