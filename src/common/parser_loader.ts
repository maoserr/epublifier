import browser from "webextension-polyfill";

export interface Parser {
    main_parser: string;
    toc_parsers: Record<string, Record<string, string>>;
    chap_main_parser: string;
    chap_parsers: Record<string, Record<string, string>>;
}

export async function get_initial(): Promise<string> {
    let result = await fetch(browser.runtime.getURL("config/default.yaml"));
    let txt = result.text();
    await browser.storage.sync.set({
        "parser_main": txt
    })
    return txt;
}


export async function load_parsers(): Promise<string> {
    let config = await browser.storage.sync.get("parser_main")
    if (config.hasOwnProperty('parser_main') && (config["parser_main"] != null)) {
        return config["parser_main"];
    } else {
        return get_initial();
    }
}

export async function save_parsers(txt: string) {
    await browser.storage.sync.set({
        "parser_main": txt
    })
}