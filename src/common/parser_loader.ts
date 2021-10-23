import browser from "webextension-polyfill";
import {load} from "js-yaml";

export interface Parser {
    main_parser: string;
    toc_parsers: Record<string, Record<string, string>>;
    chap_main_parser: string;
    chap_parsers: Record<string, Record<string, string>>;
}

export async function get_initial(): Promise<Record<string,Parser>> {
    let result = await fetch(browser.runtime.getURL("config/default.yaml"));
    let txt = await result.text();
    let parser = load(txt) as Parser
    await browser.storage.sync.set({
        "parsers": {"main": parser}
    })
    return {"main": parser};
}


export async function load_parsers(): Promise<Record<string,Parser>> {
    let config = await browser.storage.sync.get("parsers")
    if (config.hasOwnProperty('parsers') && (config["parsers"] != null)) {
        return config["parsers"];
    } else {
        return get_initial();
    }
}

export async function save_parsers(parser: Record<string,Parser>) {
    await browser.storage.sync.set({
        "parser": parser
    })
}