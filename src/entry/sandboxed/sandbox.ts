import {SbxCommand, SbxReply, SbxResult} from "../../common/sandbox_util"
import {load_parsers, parse_source} from "./parser_util"

/**
 * Sends reply to main window
 * @param source Msg source
 * @param reply Reply command
 * @param msg Message
 * @param data Reply data
 */
export function send_reply(source: MessageEventSource,
                           reply: SbxReply,
                           msg: string,
                           data?: string) {
    source.postMessage({
        command: reply,
        message: msg,
        data: data
    }, "*" as WindowPostMessageOptions);
}

/**
 * Command to function mappings
 */
const listener_cmds: Record<number, (data:any)=>Promise<SbxResult>> = {
    [SbxCommand.ParseSource]: parse_source,
    [SbxCommand.LoadParsers]: load_parsers
}

/**
 * Main sandbox listener function
 * @param event Input event
 */
async function window_listener(event: MessageEvent) {
    try {
        if (event.origin !== window.location.origin) {
            send_reply(event.source!, SbxReply.Error,
                "Invalid origin: " + event.origin)
            return
        }
        let cmd: number = event.data.command
        if (cmd in listener_cmds) {
            let res:SbxResult = await listener_cmds[cmd](event.data.data)
            send_reply(event.source!, res.reply, res.message, res.data)
            return
        } else {
            send_reply(event.source!, SbxReply.Error,
                "Unknown command: " + cmd.toString())
        }
    } catch (error) {
        send_reply(event.source!, SbxReply.Error,
            ((error instanceof Error) ? error.message : String(error)))
    }
}

window.addEventListener('message', window_listener);
