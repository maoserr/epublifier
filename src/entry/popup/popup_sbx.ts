import {run_auto_parser} from "../../common/parser_sbx";
import {SbxReply, SbxResult} from "../sandboxed/messages";
import {ParserResultAuto} from "../../common/parser_types";

/**
 * Parse source using parser
 * @param data
 */
export async function parse_source(data: any): Promise<SbxResult<ParserResultAuto>> {
    let res = await run_auto_parser(data)
    return Promise.resolve({
        reply: SbxReply.Source,
        message: res.result.message,
        data: res,
    })
}
