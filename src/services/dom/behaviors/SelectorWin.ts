export default class SelectorWin {
  private readonly doc: Document
  private overlay:HTMLDivElement

  constructor(doc:Document) {
    this.doc = doc
    this.overlay = this.doc.createElement('div')
    this.overlay.style.backgroundColor = 'rgba(1, 1, 1, 0.7)'
    this.overlay.style.bottom = "0"
    this.overlay.style.left = "0"
    this.overlay.style.position = "fixed"
    this.overlay.style.right = "0"
    this.overlay.style.top = "0"
    this.overlay.style.zIndex = "9000000000000000000"
    this.doc.body.appendChild(this.overlay)
  }

  get_move(e: any) {
    this.all_els = (this.doc.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[])
  }
}
