import browser from "webextension-polyfill";
import {SbxOutStatus, SbxOut, SbxIn, SbxInInternal} from './sandbox_types';

/**
 * Class to setup an input pipeline to the sandbox iframe
 */
export default class SandboxInput {
  private readonly ifram: HTMLIFrameElement
  private win: Window
  private curr_id = 1
  private inputs: Record<number, { resolve: Function, reject: Function }> = {}

  constructor(doc: Document, win: Window) {
    this.ifram = doc.createElement('iframe')
    this.ifram.src = browser.runtime.getURL('sandbox.html')
    this.ifram.sandbox.add('allow-scripts')
    this.ifram.sandbox.add('allow-forms')
    this.ifram.title = "Sandbox"
    this.ifram.hidden = true
    doc.body.appendChild(this.ifram)
    this.win = win
    this.setup_sbx_listener()
  }

  /**
   * Sends a message to the sandbox (from non-sandbox window)
   * @param data Data
   * @constructor
   */
  private send_sandbox_cmd<T>(data: SbxInInternal<T>): void {
    this.ifram.contentWindow!.postMessage(JSON.stringify(data),
      '*' as WindowPostMessageOptions)
  }

  /**
   * Sets up a listener to listen for result from sandbox
   * @constructor
   */
  private setup_sbx_listener() {
    this.win.addEventListener('message',
      (event: MessageEvent<SbxOut<any>>) => {
        if (event.origin !== "null") {
          // Not from sandbox
          return
        }
        if (!("sbx_id" in event.data )){
          return
        }
        let id: number = event.data.sbx_id as number
        const err_func = this.inputs[id].reject
        const success_func = this.inputs[id].resolve
        delete this.inputs[id]
        if (!("data" in event))
          return err_func("No data")
        if (!("status" in event.data))
          return err_func("No status")
        if (event.data.status == SbxOutStatus.Error)
          return err_func(event.data.message)
        return success_func(event.data);
      })
  }

  /**
   * Sends a message to the sandbox and wait for reply
   * @param data data
   * @constructor
   */
  async RunInSandbox<T, S>(data: SbxIn<T>): Promise<SbxOut<S>> {
    let res: Promise<SbxOut<S>> = new Promise(
      (resolve, reject) => {
        this.inputs[this.curr_id] = {resolve: resolve, reject: reject}
      })
    const internal_data = data as SbxInInternal<T>
    internal_data["sbx_id"] = this.curr_id
    this.send_sandbox_cmd(internal_data);
    this.curr_id++;
    return res
  }
}
