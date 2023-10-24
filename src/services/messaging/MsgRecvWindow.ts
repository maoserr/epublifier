import {MsgCommand, MsgInInternal, MsgOut, MsgOutInternal, MsgOutStatus} from "./msg_types";

export function msg_ok<T>(msg: string, data: T): MsgOut<T> {
  return {
    status: MsgOutStatus.Ok,
    message: msg,
    data: data
  }
}

/**
 * Message receiving window
 */
export default class MsgRecvWindow {
  private readonly procs?: Function

  /**
   *
   * @param win Window that send/receives messages
   * @param msg_origin Target window origin
   * @param receive_func Reply processing function (receive only)
   */
  constructor(win: Window,
              msg_origin: string,
              receive_func?: Function
  ) {
    this.procs = receive_func
    this.setup_listener(win, msg_origin)
  }

  /**
   * Handle received commands from source
   * @param data Data
   * @param source Source
   * @private
   */
  private async handle_msgin(data: MsgInInternal<any>,
                             source: Window | MessagePort | ServiceWorker) {
    let id: number = data.msg_id
    try {
      const cmd: MsgCommand = data.msg_in.command
      const edata_f = data.msg_in.data
      const res = await this.procs!(cmd, edata_f)
      this.send_reply<any>(source, res, id)
    } catch (error) {
      console.warn(error)
      this.send_reply<any>(source,
        {
          status: MsgOutStatus.Error,
          message: ((error instanceof Error) ? error.message : String(error))
        }, id)
    }
  }

  /**
   * Setup window listener
   * @param win Window
   * @param source Source to check origin
   * @private
   */
  private setup_listener(win: Window, source: string) {
    win.addEventListener('message',
      (event: MessageEvent<string>) => {
        if (event.origin !== source) {
          // Not from correct source
          return
        }
        if (!("data" in event))
          return
        const data: MsgInInternal<any> =
          JSON.parse(event.data)
        if (!("msg_id" in data)) {
          return
        }
        if (data.msg_type == "in") {
          this.handle_msgin(data, event.source!).then()
        }
      })
  }

  /**
   * Sends reply to source window
   * @param source Msg source
   * @param reply Reply
   * @param id Command ID
   */
  private send_reply<T>(source: MessageEventSource, reply: MsgOut<T>, id: number) {
    const reply_internal: MsgOutInternal<T> = {
      msg_id: id,
      msg_type: 'out',
      msg_out: reply
    }
    source.postMessage(JSON.stringify(reply_internal),
      "*" as WindowPostMessageOptions);
  }
}
