import {
  set_float_win_style,
  set_titlebar_style,
  set_closebtn_style
} from "./behaviors/styles"


export default class FloatWin {
  private readonly cont: HTMLDivElement
  private readonly titlebar: HTMLDivElement
  private readonly closebtn: HTMLDivElement
  private readonly iframe: HTMLIFrameElement

  constructor(doc: Document) {
    this.cont = doc.createElement('div')
    this.cont.id = "epublifier_sidebar"
    set_float_win_style(this.cont)
    doc.body.appendChild(this.cont)

    this.titlebar = doc.createElement('div')
    set_titlebar_style(this.titlebar)
    this.cont.appendChild(this.titlebar);

    this.closebtn = doc.createElement('div')
    set_closebtn_style(this.closebtn)
    this.closebtn.onclick = () => this.cont.style.display = "none";
    this.titlebar.appendChild(this.closebtn)

    this.iframe = document.createElement('iframe');
    this.cont.appendChild(this.iframe);
  }
}
