import browser from "webextension-polyfill";

export interface Parser {
    main_parser: string;
    toc_parsers: Record<string, Record<string, string>>;
    chap_main_parser: string;
    chap_parsers: Record<string, Record<string, string>>;
}

function get_default(): Promise<string> {
    return fetch(browser.runtime.getURL("config/default.yaml")).then(r => r.text()).then(result => {
        return result;
    })
}


export function load_parsers(): Promise<string> {
    return browser.storage.sync.get("parser_main").then(
        x => {
            if (x.hasOwnProperty('parser_main')) {
                return x["parser_main"];
            } else {
                return get_default();
            }
        }
    );
}
