import {SbxCommand, SbxReply, SbxResult} from './messages';
import {load_parsers} from "../../common/parser_sbx";
import {parse_source} from '../popup/popup_sbx';
import {parse_chapter} from '../main/main_sbx';
import {ListenerResults} from "../../common/parser_types";


/**
 * Command to function mappings
 */
const listener_cmds: Record<number, (data: any) =>
    Promise<SbxResult<ListenerResults>>> = {
    [SbxCommand.ParseSource]: parse_source,
    [SbxCommand.LoadParsers]: load_parsers,
    [SbxCommand.ParseChapter]: parse_chapter
}

/**
 * Sends reply to main window
 * @param source Msg source
 * @param reply Reply command
 * @param msg Message
 * @param data Reply data
 */
function send_reply(source: MessageEventSource,
                    reply: SbxReply,
                    msg: string,
                    data?: ListenerResults) {
    source.postMessage({
        reply: reply,
        message: msg,
        data: data
    }, "*" as WindowPostMessageOptions);
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
            let res: SbxResult<ListenerResults> = await listener_cmds[cmd](JSON.parse(event.data.data))
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
