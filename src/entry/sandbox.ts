import {load} from "js-yaml";

interface Parser {
    main_parser: string;
    toc_parsers: Record<string, string>;
    chap_parsers: Record<string, string>
}

window.addEventListener('message', function (event) {
    let command = event.data.command;
    try {
        switch (command) {
            case 'main_parse':
                let parser: Parser = load(event.data.parser) as Parser;
                let doc = event.data.doc;
                let main_func = Function(parser["main_parser"]);
                let main_out = main_func(doc["url"], doc["source"]);
                if (main_out[0] == "toc") {
                    let toc_func = Function(parser["toc_parsers"][main_out[1]])
                    let chaps = toc_func(doc["url"], doc["source"])
                    event.source.postMessage({
                        command: "toc",
                        message: "Table of contents detected and parsed.",
                        chaps: chaps,
                    }, event.origin as WindowPostMessageOptions);
                } else if (main_out[0] == "chap") {

                } else if (main_out[0] == "none"){

                } else {

                }

                break;
        }
    } catch (e) {
        event.source.postMessage({
            command: "error",
            message: "Parser error: "+ e,
        }, event.origin as WindowPostMessageOptions);
    }
});