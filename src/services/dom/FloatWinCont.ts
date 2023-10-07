import {set_closebtn_style, set_float_win_style, set_iframe_style, set_titlebar_style} from "./behaviors/styles"
import MovableWin from "./behaviors/MovableWin";
import MsgWindow, {msg_ok} from "../messaging/MsgWindow";
import {MsgCommand, MsgOut, MsgOutStatus} from "../messaging/msg_types";


/**
 * Floating window container
 */
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
      new MovableWin(doc, this.cont, titlebar)


      setTimeout(() => {
        this.set_receiver(win,
          new URL(src).origin, iframe.contentWindow!)
        iframe.src = src + "?origin=" + window.location.origin
      }, 0)
    } else {
      console.info("Showing already loaded.")
      this.cont = prev_cont as HTMLDivElement
      set_float_win_style(this.cont)
    }
  }

  private set_receiver(win: Window, origin: string, target: Window) {
    return new MsgWindow(win, origin, target,
      (cmd: MsgCommand, data: any
      ): MsgOut<any> => {
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

        }
        return {
          status: MsgOutStatus.Error,
          message: "Unknown command: " + cmd.toString()
        }
      })
  }
}
