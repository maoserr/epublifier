export let browser:any;
let is_loaded = false;
let id = {runtime:{id:1}}
declare global {
    
}

const browser_stub = {

}
export function setup_browser():void {
    chrome?.runtime?.id
    if (!is_loaded) {
        if (browser == undefined) {
            browser = browser_stub
        } else {
            browser = require("webextension-polyfill");
        }
    }
}
