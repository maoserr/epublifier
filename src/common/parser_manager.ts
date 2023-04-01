import {isProbablyReaderable, Readability} from "@mozilla/readability";
import {browser} from './browser_utils'

export function get_helpers(ext_url: URL) {
    return {
        "readability": function (dom: Document) {
            return new Readability(dom).parse();
        },
        "readerable": function (dom: Document, opt: any) {
            return isProbablyReaderable(dom, opt)
        },
        "link_fixer": function (link: string, base_url: string) {
            let c_url = new URL(base_url);
            return link
                .replace(ext_url.origin, c_url.origin)
                .replace(ext_url.protocol, c_url.protocol)
        }
    }
}

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
    await browser.storage.local.set({
        "parsers": JSON.stringify({"main": parser})
    })
    return {"main": parser};
}


export async function load_parsers(): Promise<Record<string, string>> {
    let config = await browser.storage.local.get("parsers")
    if (config.hasOwnProperty('parsers') && (config["parsers"] != null)) {
        return JSON.parse(config["parsers"]);
    } else {
        return get_initial();
    }
}

export async function save_parsers(parser: Record<string, string>) {
    await browser.storage.local.set({
        "parsers": JSON.stringify(parser)
    })
}
