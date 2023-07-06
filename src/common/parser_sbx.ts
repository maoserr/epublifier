import {SbxOutStatus, SbxOut} from "./messages";
import {ParserDocDef, ParserParams, ParserResultChap, ParserResultAuto, ParserResultToc} from "./parser_types";
import {isProbablyReaderable, Readability} from "@mozilla/readability";


let main_parser: any
let parsers: Record<string, any> = {}

/**
 * Parser Document
 */
interface ParseDoc {
    main: CallableFunction;
    toc_parsers: Record<string, ParserDefinition>;
    chap_parsers: Record<string, ParserDefinition>;
}

/**
 * Parser definition
 */
interface ParserDefinition {
    func: CallableFunction;
    inputs: Record<string, any>
}

/**
 * Get helper functions
 */
function get_helpers() {
    const ext_url = new URL(window.location.origin)
    return {
        "readability": function (dom: Document) {
            return new Readability(dom).parse();
        },
        "readerable": isProbablyReaderable,
        "link_fixer": function (link: string, base_url: string) {
            let c_url = new URL(base_url);
            return link
                .replace(ext_url.origin, c_url.origin)
                .replace(ext_url.protocol, c_url.protocol)
        }
    }
}


/**
 * Load parsers from config
 * @param data
 */
export async function load_parsers(data: any): Promise<SbxOut<ParserDocDef[]>> {
    let parse_defs: ParserDocDef[] = []
    for (let k in data) {
        let func = new Function(data[k] + "\nreturn load()")()
        if (k == 'main')
            main_parser = func
        else
            parsers[k] = func
        parse_defs = parse_defs.concat(
            Object.keys(func.toc_parsers).map(x=>{
                return {
                    parse_doc:k,
                    type:"toc",
                    parser:x,
                    inputs:func.toc_parsers[x].inputs
                }
            })
        )
        parse_defs = parse_defs.concat(
            Object.keys(func.chap_parsers).map(x=>{
                return {
                    parse_doc:k,
                    type:"chap",
                    parser:x,
                    inputs:func.chap_parsers[x].inputs}
            })
        )
    }
    return Promise.resolve({
        reply: SbxOutStatus.Source,
        message: 'Loaded',
        data: parse_defs
    })
}


export async function run_toc_parser(doc:string,
                                     data:ParserParams,
                                     parser: string):Promise<ParserResultToc> {
    let parsedoc: ParseDoc
    if (doc == 'main') {
        parsedoc = main_parser
    } else {
        parsedoc = parsers[doc]
    }
    return await parsedoc.toc_parsers[parser].func(data.inputs, data.url, data.src, get_helpers())

}

/**
 * Runs chapter parser
 * @param doc Parser doc
 * @param data input data
 * @param parser Parser
 */
export async function run_chap_parser(doc: string,
                                      data: ParserParams,
                                      parser: string): Promise<ParserResultChap> {
    let parsedoc: ParseDoc
    if (doc == 'main') {
        parsedoc = main_parser
    } else {
        parsedoc = parsers[doc]
    }
    return await parsedoc.chap_parsers[parser].func(data.inputs, data.url, data.src, get_helpers())
}

/**
 * Runs the popup parser, or auto page source parser
 * @param data
 */
export async function run_auto_parser(data: ParserParams): Promise<ParserResultAuto> {
    for (let k in parsers) {
        let res = await parsers[k].main(data.inputs, data.url, data.src, get_helpers())
        if (res !== undefined) {
            res.parse_doc = k
            res.inputs = {}
            return Promise.resolve(res)
        }
    }
    let res: ParserResultAuto = await main_parser.main(data.inputs, data.url, data.src, get_helpers())
    res.parse_doc = 'main'
    res.inputs = {}
    return Promise.resolve(res)
}
