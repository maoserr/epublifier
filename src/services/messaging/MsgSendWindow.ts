import {MsgCommand, MsgIn, MsgInInternal, MsgOut, MsgOutInternal, MsgOutStatus} from "./msg_types";


/**
 * Message sending window
 */
export default class MsgSendWindow {
  private msg_target?: Window
  private curr_id = 1
  private inputs: Record<number, { resolve: Function, reject: Function }> = {}

  /**
   *
   * @param win Window that send/receives messages
   * @param msg_origin Target window origin
   * @param send_target Target to send messages to
   */
  constructor(win: Window,
              msg_origin: string,
              send_target?: Window,
  ) {
    this.msg_target = send_target
    this.setup_listener(win, msg_origin)
  }

  /**
   * Sends a message to target
   * @param data Data
   * @param tries Number of tries
   * @param timeout
   */
  async send_message<T, S>(data: MsgIn<T>,
                           tries: number = 2,
                           timeout: number = 100
  ): Promise<MsgOut<S>> {
    this.curr_id++;
    let curr_try = 0
    let curr_res = {
      status: MsgOutStatus.Timeout,
      message: "Message timed out."
    }
    while (curr_try < tries) {
      let res: Promise<MsgOut<S>> = new Promise(
        (resolve, reject) => {
          this.inputs[this.curr_id] = {resolve: resolve, reject: reject}
        })
      let timeout_p: Promise<MsgOut<S>> = new Promise(
        (res) => setTimeout(() => res({
          status: MsgOutStatus.Timeout,
          message: "Message timed out."
        }), timeout)
      )
      const internal_data: MsgInInternal<T> = {
        msg_id: this.curr_id,
        msg_type: 'in',
        msg_in: data
      }
      internal_data["msg_id"] = this.curr_id
      this.msg_target!.postMessage(JSON.stringify(internal_data),
        '*' as WindowPostMessageOptions)
      if (timeout > 0) {
        curr_res = await Promise.race([res, timeout_p])
      } else {
        curr_res = await res
      }
      if (curr_res.status != MsgOutStatus.Timeout) {
        return curr_res
      }
      curr_try++
      console.log("Trying again", curr_try)
    }
    return curr_res
  }

  /**
   * Handle returning messages from target
   * @param data Data
   * @private
   */
  private handle_msgout(data: MsgOutInternal<any>) {
    let id: number = data.msg_id
    const err_func = this.inputs[id].reject
    const success_func = this.inputs[id].resolve
    delete this.inputs[id]
    if (!("status" in data.msg_out))
      return err_func("No status")
    if (data.msg_out.status == MsgOutStatus.Error)
      return err_func(data.msg_out.message)
    return success_func(data.msg_out);
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
        const data: MsgOutInternal<any>=
          JSON.parse(event.data)
        if (!("msg_id" in data)) {
          return
        }
        if (data.msg_type == "out") {
          this.handle_msgout(data)
        }
      })
  }
}
