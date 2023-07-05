import {SbxOutStatus, SbxOut} from "../sandboxed/messages";
import {run_chap_parser} from "../common/parser_sbx";
import {Chapter} from "../common/novel_data";
import {ParserParams, ParserResultChap} from "../common/parser_types";

/**
 * Parse chapter
 * @param data
 */
export async function parse_chapter(data:any):Promise<SbxOut<ParserResultChap>> {
    const chap:Chapter = JSON.parse(data.chap)
    const inputs = data.inputs
    const id = data.id
    const doc = data.doc
    const input:ParserParams = {
        inputs: inputs,
        url: chap.info.url,
        src: doc
    }
    let res = await run_chap_parser(chap.info.parse_doc, input ,chap.info.parser)
    res.id = id
    return Promise.resolve({
        reply: SbxOutStatus.Chap,
        message: res.message,
        data: res
    })
}
