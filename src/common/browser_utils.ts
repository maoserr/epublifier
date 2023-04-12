export let browser:any;

let is_loaded = false;

declare global {
    var chrome: any;
}

export function setup_browser():void {
    if (!is_loaded) {
        if (globalThis.chrome?.runtime?.id) {
            browser = require("webextension-polyfill");
        }
    }
}
