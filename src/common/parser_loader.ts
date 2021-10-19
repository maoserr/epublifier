import browser from "webextension-polyfill";

export interface Parser {
    main_parser: string;
    toc_parsers: Record<string, Record<string, string>>;
    chap_main_parser: string;
    chap_parsers: Record<string, Record<string, string>>;
}

export function load_parsers():Promise<string> {
    return browser.storage.sync.get({"parser_main": null}).then(
        x => {
            if (x == null) {
                return fetch(browser.runtime.getURL("config/default.yaml")).then(r => r.text()).then(result => {
                    return result;
                })
            } else {
                return x["parser_main"];
            }
        }
    )
}
