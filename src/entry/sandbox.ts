import {Parser} from "../common/parser_loader";
import {Readability, isProbablyReaderable} from "@mozilla/readability";

let ext_url = new URL(window.location.origin);
let helper_funcs = {
    "readability": function (dom: Document) {
        return new Readability(dom).parse();
    },
    "readerable": function (dom: Document, opt){
        return isProbablyReaderable(dom, opt)
    },
    "link_fixer": function (link: string, base_url: string) {
        let c_url = new URL(base_url);
        return link.replace(ext_url.origin, c_url.origin).replace(ext_url.protocol, c_url.protocol)
    }
}
let AsyncFunction = Object.getPrototypeOf(async function () {
}).constructor;

async function main_parse(event: MessageEvent, pdoc: string, pcat: string, ppar: string) {
    try {
        let parser: Record<string, Parser> = JSON.parse(event.data.parser) as Record<string, Parser>;
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
            event.source.postMessage({
                command: "toc",
                message: "Table of contents detected and parsed.",
                parser: pdoc + "||toc_parsers||" + out_parser,
                meta: out_meta || {},
                chaps: chaps,
            }, event.origin as WindowPostMessageOptions);
            return;
        } else {
            event.source.postMessage({
                command: "error",
                message: "Unrecognized page type: please manually choose a parser."
            }, event.origin as WindowPostMessageOptions);
        }
    } catch (e) {
        event.source.postMessage({
            command: "error",
            message: "Main page parsing error: " + e.message + ", stack:" + e.stack
        }, event.origin as WindowPostMessageOptions);
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
            event.source.postMessage({
                command: "chap",
                message: "Chapter " + id + " detected and parsed.",
                title: chap_title,
                html: out_html,
                id: id,
            }, event.origin as WindowPostMessageOptions);
        } else {
            event.source.postMessage({
                command: "error",
                message: "Unrecognized chapter type."
            }, event.origin as WindowPostMessageOptions);
        }
    } catch (e) {
        event.source.postMessage({
            command: "error",
            message: "Chapter page parsing error: " + e.stack
        }, event.origin as WindowPostMessageOptions);
    }
}

window.addEventListener('message', async function (event) {
    let parser_sp = event.data.selparser.split("||")
    let parse_doc = parser_sp[0];
    let parse_cat = parser_sp[1];
    let parse_par = null;
    if (parser_sp.length > 2) {
        parse_par = parser_sp[2]
    }
    try {
        switch (parse_cat) {
            case 'main_parser':
            case 'toc_parsers':
                return main_parse(event, parse_doc, parse_cat, parse_par);
            case 'chap_main_parser':
            case 'chap_parsers':
                return chap_parse(event, parse_doc, parse_cat, parse_par);
        }
    } catch (e) {
        event.source.postMessage({
            command: "error",
            message: "Parser error: " + e,
        }, event.origin as WindowPostMessageOptions);
    }
});