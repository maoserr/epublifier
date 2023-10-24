import {set_closebtn_style, set_float_win_style, set_iframe_style, set_titlebar_style} from "./behaviors/styles"
import MovableWin from "./behaviors/MovableWin";
import MsgRecvWindow, {msg_ok} from "../messaging/MsgRecvWindow"
import {MsgCommand, MsgOut, MsgOutStatus} from "../messaging/msg_types";
import SelectorWin from "./behaviors/SelectorWin";

/**
 * Gets origin from window location bar
 */
export function get_origin() {
  return window.location.href
    .split("?", 2)[1]
    .split("=", 2)[1]
}

/**
 * Floating window container
 */
export default class SidebarContainer {
  private readonly cont: HTMLDivElement
  private readonly sel_win: SelectorWin

  constructor(doc: Document, win: Window, src: string) {
    let prev_cont = doc.getElementById(src)
    this.sel_win = new SelectorWin(doc)
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
      new MovableWin(doc, this.cont, titlebar)

      setTimeout(() => {
        this.set_receiver(win,
          new URL(src).origin)
        iframe.src = src + "?origin=" + window.location.origin
      }, 0)
    } else {
      console.info("Showing already loaded.")
      this.cont = prev_cont as HTMLDivElement
      set_float_win_style(this.cont)
    }
  }

  private set_receiver(win: Window, origin: string) {
    return new MsgRecvWindow(win, origin,
      async (cmd: MsgCommand, data: any
      ): Promise<MsgOut<any>> => {
        switch (cmd) {
          case MsgCommand.ContGetSource:
            if (document.head.getElementsByTagName('base').length == 0) {
              let baseEl = document.createElement('base');
              baseEl.setAttribute('href', window.location.origin);
              document.head.appendChild(baseEl)
            }
            return msg_ok<any>("Got source", {
              url: window.location.href,
              src: (new XMLSerializer()).serializeToString(document)
            })
          case MsgCommand.ContSelNext:
            const next_res = await this.sel_win.start_get((x: HTMLElement) => {
                return (x.tagName.toUpperCase() === "BUTTON"
                  || x.tagName.toUpperCase() === "A"
                  || (x.onclick != null))
              }
            )
            return msg_ok<any>("Got next", {})
        }
        return {
          status: MsgOutStatus.Error,
          message: "Unknown command: " + cmd.toString()
        }
      })
  }
}
