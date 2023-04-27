/**
 * Sets up the parser as a function, only runnable from sandbox env
 * @param parser_str
 */
import {ParserResult, SbxReply, SbxResult} from "../../common/sandbox_util";
import {isProbablyReaderable, Readability} from "@mozilla/readability";
import {Chapter} from "../../common/novel_data";

let main_parser: any
let parsers: Record<string, any> = {}
let helper_funcs = get_helpers(new URL(window.location.origin))

function get_helpers(ext_url: URL) {
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
 * Load parsers from config
 * @param data
 */
export async function load_parsers(data: any): Promise<SbxResult> {
    for (let k in data) {
        let func = new Function(data[k] + "\nreturn load()")()
        if (k == 'main')
            main_parser = func
        else
            parsers[k] = func
    }
    return Promise.resolve({reply: SbxReply.Ok, message: 'Loaded'})
}

/**
 * Parse source using parser
 * @param data
 */
export async function parse_source(data: any): Promise<SbxResult> {
    let res: ParserResult | undefined
    let parser = 'main'
    for (let k in parsers) {
        res = parsers[k]['main'](data.inputs, data.url, data.src, helper_funcs)
        if (res !== undefined)
            parser = k
    }
    if (res === undefined) {
        res = main_parser['main'](data.inputs, data.url, data.src, helper_funcs)
    }
    res!['parse_doc']=parser
    return Promise.resolve({
        reply: SbxReply.Ok,
        message: res!.parser_msg,
        data: res,
    })
}

/**
 * Parse chapter
 * @param data
 */
export async function parse_chapter(data:any):Promise<SbxResult> {
    const chap:Chapter = JSON.parse(data.chap)
    const inputs = data.inputs
    const id = data.id
    const doc = data.doc
    let res
    console.log(chap)
    console.log(main_parser)
    if (chap.info.parse_doc == 'main') {
        res = await main_parser['parsers']
            [chap.info.parser]['func'](inputs,chap.info.url, doc, helper_funcs)
    } else {
        res = await parsers[chap.info.parse_doc]['parsers']
            [chap.info.parser]['func'](inputs,chap.info.url, doc, helper_funcs)
    }
    res['id'] = id
    console.log(res)
    return Promise.resolve({
        reply: SbxReply.Chap,
        message: res!.msg,
        data: res
    })
}
