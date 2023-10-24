import browser from "webextension-polyfill";
import MsgSendWindow from "./MsgSendWindow"
import {MsgOut, MsgIn} from './msg_types';

/**
 * Class to setup an input pipeline to the sandbox iframe
 */
export default class SandboxInput {
  private readonly ifram: HTMLIFrameElement
  private msg_win: MsgSendWindow

  /**
   * Creates the Sandbox iframe
   * @param doc
   * @param win
   * @param onrdy
   */
  constructor(doc: Document, win: Window, onrdy: Function) {
    this.ifram = doc.createElement('iframe')
    this.ifram.src = browser.runtime.getURL('sandbox.html')
    this.ifram.sandbox.add('allow-scripts')
    this.ifram.sandbox.add('allow-forms')
    this.ifram.title = "Sandbox"
    this.ifram.hidden = true
    this.ifram.addEventListener("load", ()=>onrdy(this))
    doc.body.appendChild(this.ifram)
    this.msg_win = new MsgSendWindow(win, "null", this.ifram.contentWindow!)


  }

  /**
   * Sends message and gets response from sandbox
   * @param data Data
   * @param tries Number of tries
   * @param timeout Timeout between tries
   */
  async run_in_sandbox<T, S>(data: MsgIn<T>,
                             tries: number  = 2,
                             timeout: number = 200): Promise<MsgOut<S>> {
    return this.msg_win.send_message<T, S>(data, tries, timeout)
  }
}
