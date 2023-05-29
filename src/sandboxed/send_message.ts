import {SbxCommand, SbxReply, SbxResult} from './messages'
import {ListenerResults} from "../common/parser_types";

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
        {command: cmd, data: JSON.stringify(data)}, '*' as WindowPostMessageOptions)
}

export function SetupSbxListener(err_func: CallableFunction,
                                 success_func: CallableFunction,
                                 once: boolean = false) {
    window.addEventListener('message',
        (event) => {
            if (event.origin !== "null") {
                // Not from sandbox
                return
            }
            if (!("data" in event))
                return err_func("No data")
            if (!("reply" in event.data))
                return err_func("No command")
            if (event.data.reply == SbxReply.Error)
                return err_func(event.data.message)
            return success_func(event.data);
        }, {once: once})
}

/**
 * Sends a message to the sandbox and wait for reply
 * @param cmd SbxCommand
 * @param data data
 * @constructor
 */
export async function SendSandboxCmdWReply(
    cmd: SbxCommand, data: any): Promise<SbxResult<ListenerResults>> {
    let res: Promise<any> = new Promise(
        (resolve, reject) => {
            SetupSbxListener(reject, resolve, true);
        })
    SendSandboxCmd(cmd, data);
    return res
}

