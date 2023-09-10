import browser from "webextension-polyfill";
import MsgWindow from "./MsgWindow"
import {MsgOut, MsgIn} from './msg_types';

/**
 * Class to setup an input pipeline to the sandbox iframe
 */
export default class SandboxInput {
  private readonly ifram: HTMLIFrameElement
  private msg_win:MsgWindow
  /**
   * Creates the Sandbox iframe
   * @param doc
   * @param win
   */
  constructor(doc: Document, win: Window) {
    this.ifram = doc.createElement('iframe')
    this.ifram.src = browser.runtime.getURL('sandbox.html')
    this.ifram.sandbox.add('allow-scripts')
    this.ifram.sandbox.add('allow-forms')
    this.ifram.title = "Sandbox"
    this.ifram.hidden = true
    doc.body.appendChild(this.ifram)
    this.msg_win = new MsgWindow(win,"null", this.ifram.contentWindow!)
  }

  /**
   * Sends message and gets response from sandbox
   * @param data Data
   */
  async run_in_sandbox<T, S>(data: MsgIn<T>): Promise<MsgOut<S>>{
    return this.msg_win.send_message<T,S>(data)
  }
}
