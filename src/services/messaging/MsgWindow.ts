import {MsgCommand, MsgIn, MsgInInternal, MsgOut, MsgOutInternal, MsgOutStatus} from "./msg_types";

export function msg_ok<T>(msg: string, data: T): MsgOut<T> {
  return {
    status: MsgOutStatus.Ok,
    message: msg,
    data: data
  }
}
/**
 * Message sending window
 */
export default class MsgWindow {
  private msg_target?: Window
  private curr_id = 1
  private inputs: Record<number, { resolve: Function, reject: Function }> = {}
  private readonly procs?: Function

  /**
   *
   * @param win Window that send/receives messages
   * @param msg_origin Target window origin
   * @param msg_target Target to send messages to (sender only)
   * @param proc_func Reply processing function (receive only)
   */
  constructor(win: Window,
              msg_origin: string,
              msg_target?: Window,
              proc_func?: Function
  ) {
    this.msg_target = msg_target
    this.procs = proc_func
    this.setup_listener(win, msg_origin)
  }

  private handle_msgout(data: MsgOutInternal<any>) {
    console.info("Msg Reply", data)
    let id: number = data.msg_id
    const err_func = this.inputs[id].reject
    const success_func = this.inputs[id].resolve
    delete this.inputs[id]
    if (!("status" in data.msg_out))
      return err_func("No status")
    if (data.msg_out.status == MsgOutStatus.Error)
      return err_func(data.msg_out.message)
    console.info("Msg success", data)
    return success_func(data.msg_out);
  }

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

  private setup_listener(win: Window, source: string) {
    win.addEventListener('message',
      (event: MessageEvent<string>) => {
        if (event.origin !== source) {
          // Not from correct source
          return
        }
        if (!("data" in event))
          return
        const data: MsgOutInternal<any> | MsgInInternal<any> =
          JSON.parse(event.data)
        if (!("msg_id" in data)) {
          return
        }
        if (data.msg_type == "in") {
          this.handle_msgin(data, event.source!)
        } else {
          this.handle_msgout(data)
        }
      })
  }

  async send_message<T, S>(data: MsgIn<T>): Promise<MsgOut<S>> {
    let res: Promise<MsgOut<S>> = new Promise(
      (resolve, reject) => {
        this.inputs[this.curr_id] = {resolve: resolve, reject: reject}
      })
    const internal_data: MsgInInternal<T> = {
      msg_id: this.curr_id,
      msg_type: 'in',
      msg_in: data
    }
    internal_data["msg_id"] = this.curr_id
    this.msg_target!.postMessage(JSON.stringify(internal_data),
      '*' as WindowPostMessageOptions)
    this.curr_id++;
    return res
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
