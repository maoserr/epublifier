import {get_parsers} from "../../common/parser_manager"
import {
    SbxCommand,
    SendSandboxCmd,
    ChkIsSandboxReply
} from "../../common/sandbox_util"

export async function parser_load() {
    let parser_txt = await get_parsers()
    SendSandboxCmd(SbxCommand.LoadParsers, parser_txt)
}

/**
 * Returns parses source code for given source/url
 * @param url URL
 * @param src Source text
 */
export async function parse_source(url: string,
                                   src: string): Promise<string> {
    let res: Promise<string> = new Promise(
        (resolve, reject) => {
            window.addEventListener('message',
                (event) => {
                    if (event.origin !== "null") {
                        reject("Invalid origin: " +
                            window.location.origin)
                    }
                    ChkIsSandboxReply(event, reject)
                    resolve(event.data.message as string);
                }, {once: true})
        })
    SendSandboxCmd(SbxCommand.ParseSource, {url, src})
    return res
}
