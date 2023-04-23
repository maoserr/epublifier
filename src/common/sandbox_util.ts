import {NovelMetaData} from "./novel_data";

/**
 * Sandbox commands
 */
export enum SbxCommand {
    LoadParsers,
    ParseSource,
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
    Ok
}

/**
 * Results from running initial parser
 */
export interface ParserResult {
    chaps?: any;
    type: "toc"|"chap";
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
                    if (event.origin !== "null") {
                        reject("Invalid origin: " +
                            window.location.origin)
                    }
                    if (!("data" in event))
                        reject("No data")
                    if (!("command" in event.data))
                        reject("No command")
                    if (event.data.command == SbxReply.Error)
                        reject(event.data.message)
                    resolve(event.data);
                }, {once: true})
        })

    SendSandboxCmd(cmd, data);
    return res
}

