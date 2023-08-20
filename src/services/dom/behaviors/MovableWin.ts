export default class MovableWin {
  private readonly doc: Document
  private readonly cont: HTMLDivElement
  private readonly draggable: HTMLDivElement
  private baseMouseX = 0
  private baseMouseY = 0

  evt_handleDragStart = this.handleDragStart.bind(this)
  evt_handleDragEnd = this.handleDragEnd.bind(this)
  evt_handleMouseMove = this.handleMouseMove.bind(this)


  constructor(doc: Document,
              cont: HTMLDivElement,
              draggable: HTMLDivElement) {
    this.doc = doc
    this.cont = cont
    this.draggable = draggable
  }
  enable() {
    this.draggable.addEventListener('mousedown', this.evt_handleDragStart)
  }
  disable() {
    this.draggable.removeEventListener('mousedown', this.evt_handleDragStart)
  }

  handleDragStart(evt: any) {
    this.baseMouseX = evt.offsetX
    this.baseMouseY = evt.offsetY

    this.doc.addEventListener('mouseup', this.evt_handleDragEnd)
    this.doc.addEventListener('mousemove', this.evt_handleMouseMove)
  }

  handleDragEnd() {
    this.doc.removeEventListener('mouseup', this.evt_handleDragEnd)
    this.doc.removeEventListener('mousemove', this.evt_handleMouseMove)
  }

  handleMouseMove(evt: any) {
    const frameTop = evt.clientY - this.baseMouseY
    const frameLeft = evt.clientX - this.baseMouseX
    this.cont.style.top = frameTop + 'px'
    this.cont.style.left = frameLeft + 'px'
  }
}
