import {load} from "js-yaml";
import {Chapter} from "../common/novel_data";
import {Parser} from "../common/parser_loader";

function main_parse(event: MessageEvent) {
    let parser: Parser = load(event.data.parser) as Parser;
    let doc = JSON.parse(event.data.doc);
    let main_func = Function(parser["main_parser"]);
    Promise.resolve(main_func(doc["url"], doc["source"])).then(
        main_out => {
            if (main_out[0] == "toc") {
                let toc_func = Function(parser["toc_parsers"][main_out[1]]["code"])
                Promise.resolve(toc_func(doc["url"], doc["source"])).then(
                    (chaps: Chapter[]) => {
                        event.source.postMessage({
                            command: "toc",
                            message: "Table of contents detected and parsed.",
                            parser: main_out[1],
                            chaps: chaps,
                        }, event.origin as WindowPostMessageOptions);
                    }
                )
                return;
            } else if (main_out[0] == "chap") {

            } else {
                throw new RangeError("unknown page type.")
            }
        }
    ).catch(e => {
        event.source.postMessage({
            command: "error",
            message: "Unrecognized page: " + e
        }, event.origin as WindowPostMessageOptions);
    })
}

function chap_parse(event: MessageEvent) {
    let parser: Parser = load(event.data.parser) as Parser;
    let html = event.data.doc;
    let url = event.data.url;
    let id = event.data.id;
    let title = event.data.url_title;
    let chap_main_func = Function(parser["chap_main_parser"])
    Promise.resolve(chap_main_func(url, html)).then(
        chap_main_out => {
            if (chap_main_out[0] == "chap") {
                let chap_func = Function(parser["chap_parsers"][chap_main_out[1]]["code"])
                Promise.resolve(chap_func(url, html, title)).then(
                    out => {
                        let title: string, out_html: string = out;
                        event.source.postMessage({
                            command: "chap",
                            message: "Chapter " + id + " detected and parsed.",
                            title: title,
                            html: out_html,
                            id: id,
                        }, event.origin as WindowPostMessageOptions);
                    }
                )
            } else {
                throw new RangeError("unknown chapter type.")
            }
        }
    ).catch(e => {
        event.source.postMessage({
            command: "error",
            message: "Unrecognized chapter page: " + e
        }, event.origin as WindowPostMessageOptions);
    })
}

window.addEventListener('message', function (event) {
    let command = event.data.command;
    try {
        switch (command) {
            case 'main_parse':
                return main_parse(event);
            case 'chap_parse':
                return chap_parse(event);
        }
    } catch (e) {
        event.source.postMessage({
            command: "error",
            message: "Parser error: " + e,
        }, event.origin as WindowPostMessageOptions);
    }
});