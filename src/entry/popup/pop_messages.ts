import {Ref} from "vue";
import {get_parsers} from "../../common/parser_manager"
import {
    SbxCommand,
    SendSandboxCmd,
    ChkIsSandboxReply
} from "../../common/sandbox_util"

export function event_handler(status: Ref<string>, event: any) {
    console.debug(event)
    if (event.origin !== "null") {
        console.warn("Invalid origin: " + window.location.origin)
        status.value = "Invalid origin: " + window.location.origin
        return;
    }
    if (!("data" in event))
        return
    if (!("command" in event.data))
        return
    status.value = event.data.message;
    let command = event.data.command;
    switch (command) {
        case 'toc':
            break;
        case 'fetch':
            break;

        default:
            break;
    }
}

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
