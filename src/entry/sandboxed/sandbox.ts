import {SbxCommand, SbxReply} from "../../common/sandbox_util"
import {setup_parser} from "./parser_util"

function send_reply(source: MessageEventSource,
                    reply: SbxReply,
                    msg: string,
                    data?: string) {
    source.postMessage({
        command: reply,
        message: msg,
        data: data
    }, "*" as WindowPostMessageOptions);
}

function parse_source(source: MessageEventSource) {

    send_reply(source, SbxReply.Error, 'Parser error: ')
}

function load_parsers(source: MessageEventSource, data:any) {
    for (let k in data){
        setup_parser(k, data[k])
    }

}

const listener_cmds: Record<number, any> = {
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
            listener_cmds[cmd](event.source!, event.data.data)
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
