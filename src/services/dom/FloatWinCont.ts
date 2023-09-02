import {
  set_float_win_style,
  set_titlebar_style,
  set_closebtn_style
} from "./behaviors/styles"
import MovableWin from "./behaviors/MovableWin";


export default class FloatWinCont {
  private readonly cont: HTMLDivElement

  constructor(doc: Document, src: string) {
    let prev_cont = doc.getElementById(src)
    if (prev_cont === null) {
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
      this.cont.appendChild(iframe);

      new MovableWin(doc, this.cont, titlebar)

      setTimeout(()=> iframe.src = src, 0)
    } else {
      this.cont = prev_cont as HTMLDivElement
      set_float_win_style(this.cont)
    }
  }
}
