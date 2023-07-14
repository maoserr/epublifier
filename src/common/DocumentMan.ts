
export default class DocumentManager {
  private readonly doc: Document
  private overlay: HTMLDivElement
  private all_els: HTMLElement[] = []
  evt_get_next_move = this.get_next_move.bind(this)
  evt_stop_get_next = this.stop_get_next.bind(this)

  constructor(doc: Document) {
    this.doc = doc
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

  send_src(){
    let s = new XMLSerializer();
    let src = s.serializeToString(this.doc)
  }
}
