import browser from "webextension-polyfill";
import {SbxOutStatus, SbxOut, SbxIn} from '../sandboxed/messages';

/**
 * Class to setup an input pipeline to the sandbox iframe
 */
export default class SandboxInput {
  private ifram: HTMLIFrameElement
  private win: Window

  constructor(doc: Document, win: Window) {
    this.ifram = doc.createElement('iframe')
    this.ifram.src = browser.runtime.getURL('sandbox.html')
    this.ifram.sandbox.add('allow-scripts')
    this.ifram.sandbox.add('allow-forms')
    this.ifram.title = "Sandbox"
    this.ifram.hidden = true
    doc.body.appendChild(this.ifram)
    this.win = win
  }

  /**
   * Sends a message to the sandbox (from non-sandbox window)
   * @param data Data
   * @constructor
   */
  SendSandboxCmd<T>(data: SbxIn<T>): void {
    this.ifram.contentWindow!.postMessage(JSON.stringify(data),
      '*' as WindowPostMessageOptions)
  }

  /**
   * Sets up a listener to listen for result from sandbox
   * @param err_func Error function
   * @param success_func Success function
   * @param once If true, removes listener after 1 reply
   * @constructor
   */
  SetupSbxListener<T>(err_func: CallableFunction,
                      success_func: CallableFunction,
                      once: boolean = false) {
    this.win.addEventListener('message',
      (event: MessageEvent<SbxOut<T>>) => {
        if (event.origin !== "null") {
          // Not from sandbox
          return
        }
        if (!("data" in event))
          return err_func("No data")
        if (!("status" in event.data))
          return err_func("No status")
        if (event.data.status == SbxOutStatus.Error)
          return err_func(event.data.message)
        return success_func(event.data);
      }, {once: once})
  }

  /**
   * Sends a message to the sandbox and wait for reply
   * @param data data
   * @constructor
   */
  async SendSandboxCmdWReply<T>(data: SbxIn<T>): Promise<any> {
    let res: Promise<any> = new Promise(
      (resolve, reject) => {
        this.SetupSbxListener(reject, resolve, true);
      })
    this.SendSandboxCmd(data);
    return res
  }
}
