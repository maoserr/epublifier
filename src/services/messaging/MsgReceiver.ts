import {
  MsgCommand,
  MsgInInternal,
  MsgOut,
  MsgOutInternal,
  MsgOutStatus,
} from "./msg_types";

export default class MsgReceiver {

  constructor(win: Window, origin: string, procs:Function) {
    win.addEventListener('message',
      async (event: MessageEvent<string>) => {
        if (event.origin !== origin) {
          return
        }
        const data: MsgInInternal<any> = JSON.parse(event.data)
        console.info("Receiver Input", data)
        if (!("msg_id" in data)) {
          return
        }
        let id: number = data.msg_id
        try {
          const cmd: MsgCommand = data.msg_in.command
          const edata_f = data.msg_in.data
          const res = await procs(cmd, edata_f)
          this.send_reply<any>(event.source!, res, id)
        } catch (error) {
          console.warn(error)
          this.send_reply<any>(event.source!,
            {
              status: MsgOutStatus.Error,
              message: ((error instanceof Error) ? error.message : String(error))
            }, id)
        }
      })
  }

  /**
   * Sends reply to main window
   * @param source Msg source
   * @param reply Reply
   * @param id Command ID
   */
  send_reply<T>(source: MessageEventSource, reply: MsgOut<T>, id: number) {
    const reply_internal: MsgOutInternal<T> = {
      msg_id: id,
      msg_out: reply
    }
    source.postMessage(JSON.stringify(reply_internal),
      "*" as WindowPostMessageOptions);
  }
}
