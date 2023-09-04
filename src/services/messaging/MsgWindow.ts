import {MsgIn, MsgInInternal, MsgOut, MsgOutInternal, MsgOutStatus} from "./msg_types";


export default class MsgWindow {
  private msg_target: Window
  private curr_id = 1
  private inputs: Record<number, { resolve: Function, reject: Function }> = {}

  constructor(doc: Document, win: Window, msg_target: Window, msg_origin: string) {
    this.msg_target = msg_target
    this.setup_listener(win, msg_origin)
  }

  private setup_listener(win: Window, source: string) {
    win.addEventListener('message',
      (event: MessageEvent<string>) => {
        if (event.origin !== source) {
          // Not from correct source
          return
        }
        const data: MsgOutInternal<any> = JSON.parse(event.data)
        if (!("msg_id" in data)) {
          return
        }
        console.info("Msg Reply", data)
        let id: number = data.msg_id
        const err_func = this.inputs[id].reject
        const success_func = this.inputs[id].resolve
        delete this.inputs[id]
        if (!("data" in event))
          return err_func("No data")
        if (!("status" in data.msg_out))
          return err_func("No status")
        if (data.msg_out.status == MsgOutStatus.Error)
          return err_func(data.msg_out.message)
        console.info("Msg success", data)
        return success_func(data.msg_out);
      })
  }

  async send_message<T, S>(data: MsgIn<T>): Promise<MsgOut<S>> {
    let res: Promise<MsgOut<S>> = new Promise(
      (resolve, reject) => {
        this.inputs[this.curr_id] = {resolve: resolve, reject: reject}
      })
    const internal_data: MsgInInternal<T> = {
      msg_id: this.curr_id,
      msg_in: data
    }
    internal_data["msg_id"] = this.curr_id
    this.msg_target.postMessage(JSON.stringify(internal_data),
      '*' as WindowPostMessageOptions)
    this.curr_id++;
    return res
  }
}
