import {NovelMetaData} from "./novel_data";

/**
 * Sandbox commands
 */
export enum SbxCommand {
    LoadParsers,
    ParseSource,
    ParseChapter,
}

/**
 * Sandbox Results
 */
export interface SbxResult {
    reply: SbxReply;
    message: string;
    data?: any;
}

/**
 * Sandbox replies
 */
export enum SbxReply {
    Error,
    Ok,
    Chap,
    Epub
}

/**
 * Results from running initial parser
 */
export interface ParserResult {
    chaps?: any;
    type: "toc"|"chap";
    parse_doc: string;
    parser: string;
    parser_msg: string,
    meta: NovelMetaData;
}

/**
 * Sends a message to the sandbox (from non-sandbox window)
 * @param cmd Command
 * @param data Data
 * @constructor
 */
export function SendSandboxCmd(cmd: SbxCommand, data: any): void {
    let iframe =
        document.getElementById("sandbox") as HTMLIFrameElement;
    iframe.contentWindow!.postMessage(
        {command: cmd, data: data}, '*' as WindowPostMessageOptions)
}

export function ValidateMsg(event: MessageEvent):string|undefined {
    if (event.origin !== "null") {
        return "Invalid origin: " +
            window.location.origin
    }
    if (!("data" in event))
        return "No data"
    if (!("command" in event.data))
        return "No command"
    if (event.data.command == SbxReply.Error)
        return event.data.message
    return
}

/**
 * Sends a message to the sandbox and wait for reply
 * @param cmd SbxCommand
 * @param data data
 * @constructor
 */
export async function SendSandboxCmdWReply(cmd: SbxCommand, data: any): Promise<SbxResult> {
    let res: Promise<any> = new Promise(
        (resolve, reject) => {
            window.addEventListener('message',
                (event) => {
                    const res = ValidateMsg(event)
                    if (res !== undefined) {
                        reject(res)
                    }
                    resolve(event.data);
                }, {once: true})
        })

    SendSandboxCmd(cmd, data);
    return res
}

