import {generate_epub} from "../common/epub_generator";
import {get_helpers} from "../common/parser_manager";
import { NovelData } from "../common/novel_data";

let helper_funcs = get_helpers(new URL(window.location.origin))
let AsyncFunction = Object.getPrototypeOf(async function () {
}).constructor;

async function main_parse(event: MessageEvent, pdoc: string, pcat: string, ppar: string) {
    try {
        let parser: Record<string, string> = JSON.parse(event.data.parser) as Record<string, string>;
        let doc = JSON.parse(event.data.doc);
        let out_type = "toc"
        let out_parser
        if (pcat == "main_parser") {
            let main_func = AsyncFunction('url', 'source', 'helpers', parser[pdoc]["main_parser"]);
            let main_out = await main_func(doc["url"], doc["source"], helper_funcs);
            out_type = main_out["page_type"]
            out_parser = main_out["parser"]
        } else {
            out_parser = ppar
        }
        if (out_type == "toc") {
            let toc_func = AsyncFunction('url', 'source', 'helpers', parser[pdoc]["toc_parsers"][out_parser]["code"])
            let toc_out = await toc_func(doc["url"], doc["source"], helper_funcs);
            let chaps = toc_out["chaps"]
            let out_meta = toc_out["meta"]
            event.source!.postMessage({
                command: "toc",
                message: "Table of contents detected and parsed.",
                parser: pdoc + "||toc_parsers||" + out_parser,
                meta: out_meta || {},
                chaps: chaps,
            }, "*" as WindowPostMessageOptions);
            return;
        } else {
            event.source!.postMessage({
                command: "error",
                message: "Unrecognized page type: please manually choose a parser."
            }, "*" as WindowPostMessageOptions);
        }
    } catch (e:any) {
        event.source!.postMessage({
            command: "error",
            message: "Main page parsing error: " + e.message + ", stack:" + e.stack
        }, "*" as WindowPostMessageOptions);
    }
}


async function chap_parse(event: MessageEvent, pdoc: string, pcat: string, ppar: string) {
    try {
        let parser: Record<string, Parser> = JSON.parse(event.data.parser) as Record<string, Parser>;
        let html = event.data.doc;
        let url = event.data.url;
        let id = event.data.id;
        let title = event.data.url_title;
        let out_type = "chap"
        let out_parser
        if (pcat == "chap_main_parser") {
            let chap_main_func = AsyncFunction('url', 'source', 'helpers', parser[pdoc]["chap_main_parser"])
            let chap_main_out = await chap_main_func(url, html, helper_funcs)
            out_type = chap_main_out["chap_type"]
            out_parser = chap_main_out["parser"]
        } else {
            out_parser = ppar
        }
        if (out_type == "chap") {
            let chap_func = AsyncFunction('url', 'source', 'title', 'helpers', parser[pdoc]["chap_parsers"][out_parser]["code"])
            let out = await chap_func(url, html, title, helper_funcs)
            let chap_title: string = out["title"]
            let out_html: string = out["html"];
            event.source!.postMessage({
                command: "chap",
                message: "Chapter " + id + " detected and parsed.",
                title: chap_title,
                html: out_html,
                id: id,
            }, "*" as WindowPostMessageOptions);
        } else {
            event.source!.postMessage({
                command: "error",
                message: "Unrecognized chapter type."
            }, "*" as WindowPostMessageOptions);
        }
    } catch (e:any) {
        event.source!.postMessage({
            command: "error",
            message: "Chapter page parsing error: " + e.stack
        }, "*" as WindowPostMessageOptions);
    }
}

async function gen_epub_call(event: MessageEvent<any>, nov_data: NovelData) {
    let filecontent: Blob | undefined = await generate_epub(nov_data, function (msg: string) {
        event.source!.postMessage({
            command: "status",
            message: msg
        }, "*" as WindowPostMessageOptions)
    });
    event.source!.postMessage({
        command: "epub_file",
        message: "Epub generated.",
        file: filecontent,
        filename: nov_data.filename
    }, "*" as WindowPostMessageOptions)
}

window.addEventListener('message', async function (event) {
    try {
        switch (event.data.command) {
            case "parse":
                let parser_sp = event.data.selparser.split("||")
                let parse_doc = parser_sp[0];
                let parse_cat = parser_sp[1];
                let parse_par = null;
                if (parser_sp.length > 2) {
                    parse_par = parser_sp[2]
                }
                switch (parse_cat) {
                    case 'main_parser':
                    case 'toc_parsers':
                        return main_parse(event, parse_doc, parse_cat, parse_par);
                    case 'chap_main_parser':
                    case 'chap_parsers':
                        return chap_parse(event, parse_doc, parse_cat, parse_par);
                }
                break;
            case 'epub_gen':
                let nov_data = JSON.parse(event.data.nov_data);
                nov_data.cover = event.data.cover;
                return gen_epub_call(event, nov_data);
        }
    } catch (e) {
        event.source!.postMessage({
            command: "error",
            message: "Parser error: " + e,
        }, "*" as WindowPostMessageOptions);
    }
});
