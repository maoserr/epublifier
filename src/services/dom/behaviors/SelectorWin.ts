export default class SelectorWin {
  private readonly doc: Document
  private overlay?: HTMLDivElement
  private curr_candidates?: HTMLElement[]
  private curr_filt_func?: (x: HTMLElement) => any
  private promise?: { resolve: Function, reject: Function }

  evt_get_move = this.get_move.bind(this)
  evt_stop_get = this.stop_get.bind(this)

  constructor(doc: Document) {
    this.doc = doc

  }

  private create_overlay() {
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

  async start_get(filt_fn: (x: HTMLElement) => any) {
    if (this.promise != undefined) {
      return Promise.reject(new Error("Already getting another."))
    }
    this.create_overlay()
    this.doc.addEventListener('mousemove', this.evt_get_move)
    this.doc.addEventListener('mousedown', this.evt_stop_get)
    this.curr_filt_func = filt_fn
    return await new Promise(
      (resolve, reject) => {
        this.promise = {resolve: resolve, reject: reject}
      })
  }

  get_move(e: any) {
    const candidate_els: Element[] = this.doc.elementsFromPoint(e.clientX, e.clientY)
      .filter(x => x != this.overlay)
    this.curr_candidates = (candidate_els as HTMLElement[])
      .filter(this.curr_filt_func!)
  }

  stop_get(e: any) {
    if (this.overlay) {
      this.overlay.remove()
    }
    this.doc.removeEventListener('mousemove', this.evt_get_move)
    this.doc.removeEventListener('mousedown', this.evt_stop_get)
    this.promise!.resolve(this.curr_candidates!)
    this.promise = undefined
  }
}
