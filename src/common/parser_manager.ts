
import browser from "webextension-polyfill"

/**
 * Sets up the parser as a function, only runnable from sandbox env
 * @param parser_str
 */
export async function setup_parser(parser_str: string): Promise<Function> {

    let AsyncFunction = Object.getPrototypeOf(
        async function () {
        }
    ).constructor;
    let parser = AsyncFunction('url', 'source', 'helpers', parser_str)
    return parser
}

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
