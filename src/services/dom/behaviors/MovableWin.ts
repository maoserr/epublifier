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
              draggable: HTMLDivElement,
              enable = true) {
    this.doc = doc
    this.cont = cont
    this.draggable = draggable
    if (enable) {
      this.enable()
    }
  }
  enable() {
    this.draggable.addEventListener('mousedown', this.evt_handleDragStart)
    this.draggable.addEventListener('touchstart', this.evt_handleDragStart)
  }
  disable() {
    this.draggable.removeEventListener('mousedown', this.evt_handleDragStart)
    this.draggable.removeEventListener('touchstart', this.evt_handleDragStart)
  }

  handleDragStart(evt: TouchEvent | MouseEvent) {
    if (evt instanceof TouchEvent){
      const cont_r = this.cont.getBoundingClientRect()
      this.baseMouseX = evt.touches[0].clientX  - cont_r.x
      this.baseMouseY = evt.touches[0].clientY  - cont_r.y
    } else {
      this.baseMouseX = evt.offsetX
      this.baseMouseY = evt.offsetY
    }

    this.doc.addEventListener('mouseup', this.evt_handleDragEnd)
    this.doc.addEventListener('touchend', this.evt_handleDragEnd)
    this.doc.addEventListener('touchcancel', this.evt_handleDragEnd)

    this.doc.addEventListener('mousemove', this.evt_handleMouseMove)
    this.doc.addEventListener('touchmove', this.evt_handleMouseMove)
  }

  handleDragEnd() {
    this.doc.removeEventListener('mouseup', this.evt_handleDragEnd)
    this.doc.removeEventListener('touchend', this.evt_handleDragEnd)
    this.doc.removeEventListener('touchcancel', this.evt_handleDragEnd)

    this.doc.removeEventListener('mousemove', this.evt_handleMouseMove)
    this.doc.removeEventListener('touchmove', this.evt_handleMouseMove)
  }

  handleMouseMove(evt: TouchEvent | MouseEvent) {
    let frameTop
    let frameLeft
    if (evt instanceof  TouchEvent){
      frameTop = evt.touches[0]?.clientY - this.baseMouseY
      frameLeft = evt.touches[0]?.clientX - this.baseMouseX
    } else {
      frameTop = evt.clientY - this.baseMouseY
      frameLeft = evt.clientX - this.baseMouseX
    }

    this.cont.style.top = frameTop + 'px'
    this.cont.style.left = frameLeft + 'px'
  }
}
