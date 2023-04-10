export let browser:any;
let is_loaded = false;
let id = {runtime:{id:1}}

const browser_stub = {

}

declare global {
    var chrome: any;
}

export function setup_browser():void {
    if (!is_loaded) {
        if (!globalThis.chrome?.runtime?.id) {
            browser = browser_stub
        } else {
            browser = require("webextension-polyfill");
        }
    }
}
