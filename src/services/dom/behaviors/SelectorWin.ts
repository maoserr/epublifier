export default class SelectorWin {
  private readonly doc: Document
  private overlay?: HTMLDivElement
  private curr_candidate?: HTMLElement
  private old_style: string
  private curr_filt_func?: (x: HTMLElement) => any
  private promise?: { resolve: Function, reject: Function }

  evt_get_move = this.get_move.bind(this)
  evt_stop_get = this.stop_get.bind(this)

  constructor(doc: Document) {
    this.doc = doc
    this.old_style = ""
  }

  private create_overlay() {
    this.overlay = this.doc.createElement('div')
    this.overlay.style.backgroundColor = 'rgba(1, 1, 1, 0.7)'
    this.overlay.style.touchAction = "none"
    this.overlay.style.bottom = "0"
    this.overlay.style.left = "0"
    this.overlay.style.position = "fixed"
    this.overlay.style.right = "0"
    this.overlay.style.top = "0"
    this.overlay.style.zIndex = "9000000000000000000"
    this.doc.body.appendChild(this.overlay)
  }

  async start_get(filt_fn: (x: HTMLElement) => any): Promise<HTMLElement | undefined> {
    if (this.promise != undefined) {
      return Promise.reject(new Error("Already getting another."))
    }
    this.create_overlay()
    this.doc.addEventListener('mousemove', this.evt_get_move)
    this.doc.addEventListener('touchmove', this.evt_get_move)

    this.doc.addEventListener('mousedown', this.evt_stop_get)
    this.doc.addEventListener('touchend', this.evt_stop_get)
    this.doc.addEventListener('touchcancel', this.evt_stop_get)
    this.curr_filt_func = filt_fn
    return await new Promise(
      (resolve, reject) => {
        this.promise = {resolve: resolve, reject: reject}
      })
  }

  get_move(e: TouchEvent | MouseEvent) {
    let x,y
    if (e instanceof TouchEvent){
      x = e.touches[0].clientX
      y = e.touches[0].clientY
    } else {
      x = e.clientX
      y = e.clientY
    }
    const candidate_els: Element[] = this.doc.elementsFromPoint(x, y)
      .filter(x => x != this.overlay)
    const filt_candidates = (candidate_els as HTMLElement[])
      .filter(this.curr_filt_func!)
    if (filt_candidates.length > 0) {
      if (this.curr_candidate != undefined) {
        this.curr_candidate.style.border = this.old_style
      }
      this.curr_candidate = filt_candidates[0]
      this.old_style = this.curr_candidate.style.border
      this.curr_candidate.style.border = "3px solid red"
    }
  }

  stop_get(e: TouchEvent | MouseEvent) {
    if (this.overlay) {
      this.overlay.remove()
    }
    this.doc.removeEventListener('mousemove', this.evt_get_move)
    this.doc.removeEventListener('touchmove', this.evt_get_move)
    this.doc.removeEventListener('mousedown', this.evt_stop_get)
    this.doc.removeEventListener('touchend', this.evt_stop_get)
    this.doc.removeEventListener('touchcancel', this.evt_stop_get)
    if (this.curr_candidate != undefined) {
      this.curr_candidate.style.border = this.old_style
    }
    this.promise!.resolve(this.curr_candidate!)
    this.promise = undefined
    this.curr_candidate = undefined
  }
}
