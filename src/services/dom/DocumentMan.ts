export default class DocumentManager {
  private readonly doc: Document
  private overlay: HTMLDivElement
  private all_els: HTMLElement[] = []
  private tit_els: HTMLElement[] = []
  private next_opt = 'click'
  evt_get_next_move = this.get_next_move.bind(this)
  evt_stop_get_next = this.stop_get_next.bind(this)
  evt_get_title_move = this.get_title_move.bind(this)
  evt_stop_title_move = this.stop_get_title.bind(this)

  constructor(doc: Document) {
    this.doc = doc
    this.overlay = (doc.getElementById('overlay') as HTMLDivElement)
  }

  get_next_move(e: any) {
    this.all_els = (this.doc.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[])
      .filter(x => x != this.overlay)
      .filter(x => (x.tagName.toUpperCase() === "BUTTON"
        || x.tagName.toUpperCase() === "A"
        || (x.onclick != null)
      ),)
  }

  stop_get_next(e: any) {
    this.overlay.remove()
    this.doc.removeEventListener('mousemove', this.evt_get_next_move)
    this.doc.removeEventListener('mousedown', this.evt_stop_get_next)
  }

  get_next_link() {
    this.overlay = this.doc.createElement('div')
    this.overlay.style.backgroundColor = 'rgba(1, 1, 1, 0.7)'
    this.overlay.style.bottom = "0"
    this.overlay.style.left = "0"
    this.overlay.style.position = "fixed"
    this.overlay.style.right = "0"
    this.overlay.style.top = "0"
    this.overlay.style.zIndex = "9000000000000000000"
    this.doc.body.appendChild(this.overlay)
    this.doc.addEventListener('mousemove', this.evt_get_next_move)
    this.doc.addEventListener('mousedown', this.evt_stop_get_next)
  }

  get_title_move(e: any) {
    this.tit_els = (document.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[])
      .filter(x => x != this.overlay)
      .filter(x => (x.tagName.toUpperCase().match(/H\d/i)
        || x.tagName.toUpperCase() === "EM"
      ),)
  }
  stop_get_title(e: any) {
    // reply_func({msg: 'SELECTED_NEXT', els: this.tit_els.length})
    this.overlay.remove()
    document.removeEventListener('mousemove', this.evt_get_title_move)
    document.removeEventListener('mousedown', this.evt_stop_title_move)
  }

  get_title_link() {
    this.overlay = this.doc.createElement('div')
    this.overlay.style.backgroundColor = 'rgba(1, 1, 1, 0.7)'
    this.overlay.style.bottom = "0"
    this.overlay.style.left = "0"
    this.overlay.style.position = "fixed"
    this.overlay.style.right = "0"
    this.overlay.style.top = "0"
    this.overlay.style.zIndex = "9000000000000000000"
    this.doc.body.appendChild(this.overlay)
    this.doc.addEventListener('mousemove', this.evt_get_title_move)
    this.doc.addEventListener('mousedown', this.evt_stop_title_move)
  }

  send_src(){
    let s = new XMLSerializer();
    return s.serializeToString(this.doc)
  }

  async run_parse(max_chaps: number, wait_s: number, scroll: boolean) {

    let s = new XMLSerializer();
    for (let i = 0; i < max_chaps; i++) {
      let src = s.serializeToString(document)
      let title = ""
      if (this.tit_els.length > 0) {
        title = this.tit_els[0].innerText
      }
      // reply_func({msg: 'PARSED_PAGE', source: src, title: title, status: "Testa"})
      if (this.next_opt === "click") {
        if (this.all_els.length == 0) {
          break
        }
        this.all_els[0].click()
      } else if (this.next_opt === "right") {

      } else if (this.next_opt === "down") {

      }
      await new Promise(f => setTimeout(f, Math.round(wait_s * 1000)));
      if (scroll) {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(f => setTimeout(f, Math.round(wait_s * 1000)));
      }
    }
  }
}
