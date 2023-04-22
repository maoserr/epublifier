import browser from "webextension-polyfill"

export async function get_initial(): Promise<Record<string, string>> {
    let result = await fetch(browser.runtime.getURL("config/default.js"));
    let parser = await result.text();
    return {"main": parser};
}


export async function get_parsers(): Promise<Record<string, string>> {
    // let config = await browser.storage.local.get("parsers")
    // if (config.hasOwnProperty('parsers') && (config["parsers"] != null)) {
    //     return JSON.parse(config["parsers"]);
    // } else {
        return get_initial();
    // }
}

export async function save_parsers(parser: Record<string, string>) {
    await browser.storage.local.set({
        "parsers": JSON.stringify(parser)
    })
}
