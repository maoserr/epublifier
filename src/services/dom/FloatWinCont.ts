import {
  set_float_win_style,
  set_titlebar_style,
  set_closebtn_style, set_iframe_style
} from "./behaviors/styles"
import MovableWin from "./behaviors/MovableWin";
import MsgWindow from "../messaging/MsgWindow";
import browser from "webextension-polyfill";


export default class FloatWinCont {
  private readonly cont: HTMLDivElement

  constructor(doc: Document, win: Window, src: string) {
    let prev_cont = doc.getElementById(src)
    if (prev_cont === null) {
      console.info("Creating new sidebar")
      this.cont = doc.createElement('div')
      this.cont.id = src
      set_float_win_style(this.cont)
      doc.body.appendChild(this.cont)

      const titlebar = doc.createElement('div')
      set_titlebar_style(titlebar)
      titlebar.innerText = "Epublifier"
      this.cont.appendChild(titlebar);

      const closebtn = doc.createElement('div')
      closebtn.id = "closebtn"
      set_closebtn_style(closebtn)
      closebtn.onclick = () => this.cont.style.display = "none";
      titlebar.appendChild(closebtn)

      const iframe = doc.createElement('iframe');
      iframe.id = "iframe"
      set_iframe_style(iframe)
      this.cont.appendChild(iframe);

      setTimeout(() => iframe.src = src, 0)

      new MovableWin(doc, this.cont, titlebar)
      new MsgWindow(doc, win, iframe.contentWindow!,new URL(src).origin)
    } else {
      console.info("Showing already loaded.")
      this.cont = prev_cont as HTMLDivElement
      set_float_win_style(this.cont)
    }
  }
}
