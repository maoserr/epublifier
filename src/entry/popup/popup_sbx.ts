import {run_auto_parser, run_chap_parser, run_toc_parser} from "../../common/parser_sbx";
import {SbxReply, SbxResult} from "../sandboxed/messages";
import {ParserResultAuto, ParserResultChap, ParserResultToc} from "../../common/parser_types";

/**
 * Parse source using parser
 * @param data
 */
export async function parse_source(data: any): Promise<SbxResult<ParserResultAuto | ParserResultChap | ParserResultToc>> {
    let res
    let msg:string
    if ('doc' in data) {
        if (data.type === 'toc') {
            res = await run_toc_parser(data.doc, data.params, data.parser)
        } else {
            res = await run_chap_parser(data.doc, data.params, data.parser)
        }
        msg = res.message
    } else {
        res = await run_auto_parser(data)
        msg = res.result.message
    }
    return Promise.resolve({
        reply: SbxReply.Source,
        message: msg,
        data: res,
    })
}
