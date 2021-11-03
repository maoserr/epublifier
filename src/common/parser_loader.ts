import browser from "webextension-polyfill";
import {load} from "js-yaml";

export interface Parser {
    main_parser: string;
    toc_parsers: Record<string, Record<string, string>>;
    chap_main_parser: string;
    chap_parsers: Record<string, Record<string, string>>;
}

export async function load_yaml_doc(yaml_txt):Promise<Parser> {
    return Object.assign({},load(yaml_txt)) as Parser
}

export async function get_initial(): Promise<Record<string,Parser>> {
    let result = await fetch(browser.runtime.getURL("config/default.yaml"));
    let txt = await result.text();
    // Ignore any YAML specific functions
    let parser = Object.assign({},load(txt)) as Parser
    await browser.storage.local.set({
        "parsers": {"main": parser}
    })
    return {"main": parser};
}


export async function load_parsers(): Promise<Record<string,Parser>> {
    let config = await browser.storage.local.get("parsers")
    if (config.hasOwnProperty('parsers') && (config["parsers"] != null)) {
        return config["parsers"];
    } else {
        return get_initial();
    }
}

export async function save_parsers(parser: Record<string,Parser>) {
    await browser.storage.local.set({
        "parsers": parser
    })
}